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
      propertyId: tenant.propertyId,
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
      createdAt: new Date()
    };

    res.json({
      success: true,
      message: 'Enhanced payment simulation completed',
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