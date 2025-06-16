import express from 'express';
import { 
  initiatePayment, 
  handleCallback, 
  handleTimeout,
  simulatePayment,
  getTenantBalance,
  generateReminders,
  testPaymentScenarios
} from '../controllers/paymentController.js';
import mpesaService from '../services/mpesaService.js';
import { db } from '../config/firebaseClient.js';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

const router = express.Router();

// Original routes
router.post('/initiate', initiatePayment);
router.post('/callback', handleCallback);
router.post('/timeout', handleTimeout);

// Enhanced simulation route (replaces old simulate-payment)
router.post('/simulate-payment', simulatePayment);

// New smart payment routes
router.get('/tenant/:tenantId/balance', getTenantBalance);
router.get('/reminders/:landlordId', generateReminders);
router.post('/test-scenarios', testPaymentScenarios);

// Testing routes (keep existing for compatibility)
router.get('/test-oauth', async (req, res) => {
  try {
    console.log('Testing M-Pesa OAuth...');
    const accessToken = await mpesaService.getAccessToken();
    
    res.json({
      success: true,
      message: 'M-Pesa credentials are working!',
      accessToken: accessToken ? 'Token received successfully' : 'Failed to get token',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('M-Pesa OAuth test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'M-Pesa credentials test failed'
    });
  }
});

// Test STK Push
router.post('/test-payment', async (req, res) => {
  try {
    const { phoneNumber = '254708374149', amount = '100', accountNumber = 'TEST123' } = req.body;
    
    console.log('Testing STK Push with:', { phoneNumber, amount, accountNumber });
    
    const result = await mpesaService.initiateSTKPush(phoneNumber, amount, accountNumber);
    
    res.json({
      success: true,
      message: 'STK Push test completed',
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('STK Push test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'STK Push test failed'
    });
  }
});

// Get all tenants for testing (shows account numbers)
router.get('/test-tenants', async (req, res) => {
  try {
    const { landlordId } = req.query;
    
    if (!landlordId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide landlordId as query parameter'
      });
    }

    const tenantsQuery = query(
      collection(db, 'tenants'),
      where('landlordId', '==', landlordId)
    );
    
    const snapshot = await getDocs(tenantsQuery);
    const tenants = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        accountNumber: data.accountNumber,
        rentAmount: data.rentAmount,
        paymentStatus: data.paymentStatus,
        accountBalance: data.accountBalance || 0,
        phone: data.phone
      };
    });

    res.json({
      success: true,
      message: `Found ${tenants.length} tenants`,
      tenants: tenants,
      instructions: 'Use any accountNumber from above to test payment'
    });

  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mock successful payment for dashboard testing
router.post('/mock-success', async (req, res) => {
  try {
    const mockPaymentData = {
      landlordId: 'test-landlord',
      tenantId: 'test-tenant',
      propertyId: 'test-property',
      amount: 50000,
      phoneNumber: '254708374149',
      accountNumber: 'TEST123',
      method: 'M-Pesa',
      status: 'completed',
      mpesaReceiptNumber: 'RK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      description: 'Test rent payment',
      createdAt: new Date()
    };

    res.json({
      success: true,
      message: 'Mock payment created successfully',
      payment: mockPaymentData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Mock payment failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test complete callback flow
router.post('/test-callback-flow', async (req, res) => {
  try {
    const { accountNumber } = req.body;
    
    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        error: 'accountNumber is required'
      });
    }

    // Find tenant
    const tenantsQuery = query(
      collection(db, 'tenants'),
      where('accountNumber', '==', accountNumber)
    );
    
    const tenantSnapshot = await getDocs(tenantsQuery);
    
    if (tenantSnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: `No tenant found with account number: ${accountNumber}`
      });
    }

    const tenantDoc = tenantSnapshot.docs[0];
    const tenant = { id: tenantDoc.id, ...tenantDoc.data() };

    // Simulate M-Pesa callback format
    const mockCallback = {
      Body: {
        stkCallback: {
          MerchantRequestID: "29115-34620561-1",
          CheckoutRequestID: "ws_CO_191220191020363925",
          ResultCode: 0,
          ResultDesc: "The service request is processed successfully.",
          CallbackMetadata: {
            Item: [
              {
                Name: "Amount",
                Value: tenant.rentAmount
              },
              {
                Name: "MpesaReceiptNumber", 
                Value: "RK" + Math.random().toString(36).substr(2, 9).toUpperCase()
              },
              {
                Name: "TransactionDate",
                Value: parseInt(Date.now().toString().slice(0, -3))
              },
              {
                Name: "PhoneNumber",
                Value: tenant.phone || "254708374149"
              }
            ]
          }
        }
      }
    };

    // Process through your actual callback handler
    const result = await mpesaService.handleCallback(mockCallback);

    res.json({
      success: true,
      message: 'Complete callback flow tested',
      tenant: {
        name: tenant.name,
        accountNumber: tenant.accountNumber
      },
      callbackResult: result,
      mockCallback: mockCallback
    });

  } catch (error) {
    console.error('Callback flow test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;