// backend/controllers/enhancedTenantController.js - Enhanced with Email Integration
import EnhancedTenantService from '../services/enhancedTenantService.js';
import EnhancedPropertyService from '../services/enhancedPropertyService.js';
import enhancedEmailService from '../services/enhancedEmailService.js';
import admin from 'firebase-admin';

export const createTenant = async (req, res) => {
  try {
    const { landlordId } = req.body;
    const tenantData = req.body;
    
    // Create tenant with auto-assignment
    const result = await EnhancedTenantService.createTenant(tenantData, landlordId);
    
    // Get the created tenant details
    const tenant = await EnhancedTenantService.getTenant(result.tenantId);
    
    // Get property details for email
    const property = await EnhancedPropertyService.getProperty(tenant.propertyId);
    
    // Get landlord details
    let landlordData = null;
    try {
      const landlordDoc = await admin.firestore()
        .collection('Users')
        .doc(landlordId)
        .get();
      
      if (landlordDoc.exists()) {
        landlordData = landlordDoc.data();
      }
    } catch (error) {
      console.error('Error fetching landlord data:', error);
    }
    
    // Send welcome email to tenant if email is provided
    if (tenant.email && property && landlordData) {
      try {
        await enhancedEmailService.sendTenantWelcomeEmail(
          {
            name: tenant.name,
            email: tenant.email,
            unitNumber: tenant.unitNumber,
            unitType: tenant.unitType,
            rentAmount: tenant.rentAmount,
            accountNumber: tenant.accountNumber
          },
          {
            name: property.name,
            location: property.location,
            paybill: property.paybill
          },
          {
            name: landlordData.name || landlordData.displayName,
            phone: landlordData.phoneNumber
          }
        );
        console.log(`✅ Welcome email sent to tenant: ${tenant.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send welcome email to tenant: ${tenant.email}`, emailError);
        // Don't fail the tenant creation if email fails
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Tenant created successfully. Welcome email sent!',
      data: {
        ...result,
        tenant: await EnhancedTenantService.getTenant(result.tenantId)
      }
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getTenants = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { propertyId, isActive } = req.query;
    
    const filters = {};
    if (propertyId) filters.propertyId = propertyId;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    
    const tenants = await EnhancedTenantService.getTenants(landlordId, filters);
    
    res.json({
      success: true,
      data: tenants
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const tenant = await EnhancedTenantService.getTenant(tenantId);
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }
    
    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const updateTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const updateData = req.body;
    
    await EnhancedTenantService.updateTenant(tenantId, updateData);
    
    res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: await EnhancedTenantService.getTenant(tenantId)
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const moveTenantOut = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { moveOutDate } = req.body;
    
    const result = await EnhancedTenantService.moveTenantOut(tenantId, moveOutDate);
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Error moving tenant out:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const transferTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { newPropertyId, newUnitType, preferredUnit } = req.body;
    
    const result = await EnhancedTenantService.transferTenant(
      tenantId, 
      newPropertyId, 
      newUnitType, 
      preferredUnit
    );
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Error transferring tenant:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const deleteTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const result = await EnhancedTenantService.deleteTenant(tenantId);
    
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

export const getTenantByAccountNumber = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const tenant = await EnhancedTenantService.getTenantByAccountNumber(accountNumber);
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }
    
    res.json({
      success: true,
      data: tenant
    });
  } catch (error) {
    console.error('Error fetching tenant by account number:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getTenantPaymentSummary = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const summary = await EnhancedTenantService.getTenantPaymentSummary(tenantId);
    
    if (!summary) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching tenant payment summary:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getTenantStatistics = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const stats = await EnhancedTenantService.getTenantStatistics(landlordId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching tenant statistics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send manual rent reminder to specific tenant
export const sendRentReminder = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { message, isUrgent = false } = req.body;
    
    // Get tenant details
    const tenant = await EnhancedTenantService.getTenant(tenantId);
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }
    
    // Get property details
    const property = await EnhancedPropertyService.getProperty(tenant.propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }
    
    // Send email reminder
    const result = await enhancedEmailService.sendMonthlyRentReminder(
      {
        name: tenant.name,
        email: tenant.email,
        unitNumber: tenant.unitNumber,
        rentAmount: tenant.rentAmount,
        accountNumber: tenant.accountNumber,
        accountBalance: tenant.accountBalance || 0
      },
      {
        name: property.name,
        paybill: property.paybill
      },
      !isUrgent // isFirstReminder
    );
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Rent reminder sent successfully',
        data: {
          tenant: tenant.name,
          email: tenant.email,
          messageId: result.messageId
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send reminder email'
      });
    }
    
  } catch (error) {
    console.error('Error sending rent reminder:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Send bulk rent reminders to all tenants with overdue payments
export const sendBulkRentReminders = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { onlyOverdue = true } = req.body;
    
    // Get all tenants for the landlord
    const tenants = await EnhancedTenantService.getTenants(landlordId, { isActive: true });
    
    // Get all properties for context
    const properties = await EnhancedPropertyService.getProperties(landlordId);
    const propertyMap = {};
    properties.forEach(property => {
      propertyMap[property.id] = property;
    });
    
    const tenantsToRemind = [];
    
    // Filter tenants based on payment status
    for (const tenant of tenants) {
      if (!tenant.email || !propertyMap[tenant.propertyId]) continue;
      
      if (onlyOverdue) {
        // Only send to tenants with overdue or pending payments
        if (tenant.paymentStatus === 'overdue' || tenant.paymentStatus === 'pending') {
          tenantsToRemind.push({
            tenant: {
              name: tenant.name,
              email: tenant.email,
              unitNumber: tenant.unitNumber,
              rentAmount: tenant.rentAmount,
              accountNumber: tenant.accountNumber,
              accountBalance: tenant.accountBalance || 0
            },
            property: {
              name: propertyMap[tenant.propertyId].name,
              paybill: propertyMap[tenant.propertyId].paybill
            }
          });
        }
      } else {
        // Send to all active tenants
        tenantsToRemind.push({
          tenant: {
            name: tenant.name,
            email: tenant.email,
            unitNumber: tenant.unitNumber,
            rentAmount: tenant.rentAmount,
            accountNumber: tenant.accountNumber,
            accountBalance: tenant.accountBalance || 0
          },
          property: {
            name: propertyMap[tenant.propertyId].name,
            paybill: propertyMap[tenant.propertyId].paybill
          }
        });
      }
    }
    
    console.log(`📧 Sending bulk reminders to ${tenantsToRemind.length} tenants`);
    
    // Send bulk reminders
    const results = await enhancedEmailService.sendBulkMonthlyReminders(tenantsToRemind);
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    res.json({
      success: true,
      message: `Bulk reminders sent: ${successful} successful, ${failed} failed`,
      data: {
        totalSent: tenantsToRemind.length,
        successful,
        failed,
        results: results
      }
    });
    
  } catch (error) {
    console.error('Error sending bulk rent reminders:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};