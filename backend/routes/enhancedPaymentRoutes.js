// backend/routes/enhancedPaymentRoutes.js
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
import EnhancedPropertyService from '../services/enhancedPropertyService.js';
import EnhancedTenantService from '../services/enhancedTenantService.js';
import admin from 'firebase-admin';

const router = express.Router();

// Original payment routes
router.post('/initiate', initiatePayment);
router.post('/callback', handleCallback);
router.post('/timeout', handleTimeout);

// Enhanced payment routes
router.post('/simulate-payment', simulatePayment);
router.get('/tenant/:tenantId/balance', getTenantBalance);
router.get('/reminders/:landlordId', generateReminders);
router.post('/test-scenarios', testPaymentScenarios);

// ADDED: Get recent payments for dashboard
router.get('/recent', async (req, res) => {
  try {
    const { landlordId, limit = 10 } = req.query;
    
    if (!landlordId) {
      return res.status(400).json({
        success: false,
        error: 'landlordId is required'
      });
    }

    // Get recent payments from Firestore
    const paymentsSnapshot = await admin.firestore()
      .collection('payments')
      .where('landlordId', '==', landlordId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .get();

    const payments = [];
    paymentsSnapshot.forEach(doc => {
      payments.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Enhance payments with tenant and property details
    const enhancedPayments = await Promise.all(
      payments.map(async (payment) => {
        try {
          // Get tenant details if tenantId exists
          let tenantName = payment.tenantName || 'Unknown Tenant';
          if (payment.tenantId) {
            const tenant = await EnhancedTenantService.getTenant(payment.tenantId);
            tenantName = tenant?.name || tenantName;
          }

          // Get property details if propertyId exists
          let propertyName = payment.propertyName || 'Unknown Property';
          if (payment.propertyId) {
            const property = await EnhancedPropertyService.getProperty(payment.propertyId);
            propertyName = property?.name || propertyName;
          }

          return {
            ...payment,
            tenantName,
            propertyName,
            // Ensure consistent date format
            createdAt: payment.createdAt || new Date(),
            // Add payment type classification
            paymentType: classifyPayment(payment.amount, payment.expectedAmount)
          };
        } catch (error) {
          console.error('Error enhancing payment:', error);
          return {
            ...payment,
            tenantName: payment.tenantName || 'Unknown Tenant',
            propertyName: payment.propertyName || 'Unknown Property'
          };
        }
      })
    );

    res.json({
      success: true,
      data: enhancedPayments,
      count: enhancedPayments.length,
      message: `Retrieved ${enhancedPayments.length} recent payments`
    });

  } catch (error) {
    console.error('Error fetching recent payments:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to classify payment types
function classifyPayment(amount, expectedAmount) {
  if (!expectedAmount || !amount) return 'exact';
  
  const amountNum = parseFloat(amount);
  const expectedNum = parseFloat(expectedAmount);
  
  if (amountNum > expectedNum) return 'overpayment';
  if (amountNum < expectedNum) return 'underpayment';
  return 'exact';
}

// Enhanced payment testing with unit verification
router.post('/simulate-enhanced', async (req, res) => {
  try {
    const { accountNumber, amount, phoneNumber } = req.body;
    
    if (!accountNumber) {
      return res.status(400).json({
        success: false,
        error: 'accountNumber is required'
      });
    }

    // Find tenant by account number using enhanced service
    const tenant = await EnhancedTenantService.getTenantByAccountNumber(accountNumber);
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: `No tenant found with account number: ${accountNumber}`
      });
    }

    // Get unit details
    const unit = await EnhancedPropertyService.getUnitByAccountNumber(accountNumber);
    
    if (!unit) {
      return res.status(404).json({
        success: false,
        error: `Unit not found for account number: ${accountNumber}`
      });
    }

    // Use tenant's rent amount or override
    const paymentAmount = amount ? parseFloat(amount) : parseFloat(tenant.rentAmount);
    const payerPhone = phoneNumber || tenant.phone || '254708374149';

    // Enhanced payment data
    const paymentData = {
      landlordId: tenant.landlordId,
      tenantId: tenant.id,
      tenantName: tenant.name,
      propertyId: tenant.propertyId,
      propertyName: unit.propertyName,
      unitNumber: tenant.unitNumber,
      unitType: tenant.unitType,
      amount: paymentAmount,
      expectedAmount: tenant.rentAmount,
      phoneNumber: payerPhone,
      accountNumber: accountNumber,
      method: 'M-Pesa',
      status: 'completed',
      mpesaReceiptNumber: 'ENH' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      description: `Rent payment for ${tenant.name} - Unit ${tenant.unitNumber}`,
      source: 'enhanced_simulation',
      paymentType: classifyPayment(paymentAmount, tenant.rentAmount),
      createdAt: new Date()
    };

    // Save payment to Firestore
    const paymentRef = await admin.firestore().collection('payments').add(paymentData);
    
    res.json({
      success: true,
      message: 'Enhanced payment simulation completed',
      paymentId: paymentRef.id,
      tenant: {
        name: tenant.name,
        unitNumber: tenant.unitNumber,
        unitType: tenant.unitType,
        accountNumber: tenant.accountNumber,
        expectedRent: tenant.rentAmount,
        currentBalance: tenant.accountBalance || 0
      },
      unit: {
        unitNumber: unit.unitNumber,
        unitType: unit.unitType,
        propertyName: unit.propertyName,
        rentAmount: unit.rentAmount
      },
      payment: paymentData,
      instructions: 'Enhanced payment processed with full unit verification'
    });

  } catch (error) {
    console.error('Enhanced payment simulation failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all tenants with unit details for testing
router.get('/test-tenants-enhanced/:landlordId', async (req, res) => {
  try {
    const { landlordId } = req.params;
    
    const tenants = await EnhancedTenantService.getTenants(landlordId, { isActive: true });
    const properties = await EnhancedPropertyService.getProperties(landlordId);
    
    const enhancedTenants = tenants.map(tenant => {
      const property = properties.find(p => p.id === tenant.propertyId);
      return {
        id: tenant.id,
        name: tenant.name,
        unitNumber: tenant.unitNumber,
        unitType: tenant.unitType,
        accountNumber: tenant.accountNumber,
        rentAmount: tenant.rentAmount,
        paymentStatus: tenant.paymentStatus,
        accountBalance: tenant.accountBalance || 0,
        phone: tenant.phone,
        propertyName: property?.name || 'Unknown Property',
        propertyLocation: property?.location || 'Unknown Location'
      };
    });

    res.json({
      success: true,
      message: `Found ${enhancedTenants.length} active tenants`,
      tenants: enhancedTenants,
      instructions: 'Use any accountNumber from above to test enhanced payment system'
    });

  } catch (error) {
    console.error('Error fetching enhanced tenants:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Validate account number format
router.get('/validate-account/:accountNumber', async (req, res) => {
  try {
    const { accountNumber } = req.params;
    
    // Check format (should be like: 823949#A1)
    const formatRegex = /^[0-9]+#[A-Za-z0-9]+$/;
    
    if (!formatRegex.test(accountNumber)) {
      return res.json({
        success: false,
        valid: false,
        error: 'Invalid account number format. Expected: [number]#[unit]'
      });
    }

    // Check if account exists
    const unit = await EnhancedPropertyService.getUnitByAccountNumber(accountNumber);
    const tenant = await EnhancedTenantService.getTenantByAccountNumber(accountNumber);
    
    res.json({
      success: true,
      valid: !!unit,
      unitExists: !!unit,
      tenantAssigned: !!tenant,
      data: {
        unit: unit || null,
        tenant: tenant || null
      }
    });

  } catch (error) {
    console.error('Error validating account number:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;