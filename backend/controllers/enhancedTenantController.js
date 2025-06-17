// backend/controllers/enhancedTenantController.js
import EnhancedTenantService from '../services/enhancedTenantService.js';

export const createTenant = async (req, res) => {
  try {
    const { landlordId } = req.body;
    const tenantData = req.body;
    
    const result = await EnhancedTenantService.createTenant(tenantData, landlordId);
    
    res.status(201).json({
      success: true,
      message: 'Tenant created successfully',
      data: result
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