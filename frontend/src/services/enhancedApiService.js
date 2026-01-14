// frontend/src/services/enhancedApiService.js - Django Backend API Service
import api from './api';

// ===== ENHANCED PROPERTY MANAGEMENT =====
export const enhancedPropertyAPI = {
  // Create property with unit types
  async createProperty(propertyData, landlordId) {
    const response = await api.post('/properties/', {
      ...propertyData,
      landlord_id: landlordId
    });
    return response.data;
  },

  // Get all properties for landlord
  async getProperties(landlordId) {
    const response = await api.get(`/properties/`, {
      params: { landlord_id: landlordId }
    });
    return response.data;
  },

  // Get single property
  async getProperty(propertyId) {
    const response = await api.get(`/properties/${propertyId}/`);
    return response.data;
  },

  // Update property
  async updateProperty(propertyId, propertyData) {
    const response = await api.put(`/properties/${propertyId}/`, propertyData);
    return response.data;
  },

  // Delete property
  async deleteProperty(propertyId) {
    const response = await api.delete(`/properties/${propertyId}/`);
    return response.data;
  },

  // Get unit types for property
  async getUnitTypes(propertyId) {
    const response = await api.get(`/properties/${propertyId}/unit-types/`);
    return response.data;
  },

  // Get available units for property by type
  async getAvailableUnits(propertyId, unitType = null) {
    const params = unitType ? { unit_type: unitType } : {};
    const response = await api.get(`/properties/${propertyId}/available-units/`, { params });
    return response.data;
  }
};

// ===== ENHANCED TENANT MANAGEMENT =====
export const enhancedTenantAPI = {
  // Create tenant with auto-assignment
  async createTenant(tenantData, landlordId) {
    const response = await api.post('/tenants/', {
      ...tenantData,
      landlord_id: landlordId
    });
    return response.data;
  },

  // Get all tenants for landlord
  async getTenants(landlordId, filters = {}) {
    const params = { landlord_id: landlordId, ...filters };
    const response = await api.get('/tenants/', { params });
    return response.data;
  },

  // Get single tenant
  async getTenant(tenantId) {
    const response = await api.get(`/tenants/${tenantId}/`);
    return response.data;
  },

  // Update tenant
  async updateTenant(tenantId, tenantData) {
    const response = await api.put(`/tenants/${tenantId}/`, tenantData);
    return response.data;
  },

  // Delete tenant
  async deleteTenant(tenantId) {
    const response = await api.delete(`/tenants/${tenantId}/`);
    return response.data;
  },

  // Move tenant out
  async moveTenantOut(tenantId, moveOutDate = null) {
    const response = await api.post(`/tenants/${tenantId}/move-out/`, {
      move_out_date: moveOutDate
    });
    return response.data;
  },

  // Transfer tenant
  async transferTenant(tenantId, transferData) {
    const response = await api.post(`/tenants/${tenantId}/transfer/`, transferData);
    return response.data;
  },

  // Get tenant by account number
  async getTenantByAccountNumber(accountNumber) {
    const response = await api.get(`/tenants/by-account/${accountNumber}/`);
    return response.data;
  },

  // Get tenant payment summary
  async getTenantPaymentSummary(tenantId) {
    const response = await api.get(`/tenants/${tenantId}/payment-summary/`);
    return response.data;
  },

  // Get tenant statistics
  async getTenantStatistics(landlordId) {
    const response = await api.get('/tenants/statistics/', {
      params: { landlord_id: landlordId }
    });
    return response.data;
  }
};

// ===== ENHANCED PAYMENT SYSTEM =====
export const enhancedPaymentAPI = {
  // Initiate M-Pesa payment
  async initiatePayment(paymentData) {
    const response = await api.post('/payments/initiate/', paymentData);
    return response.data;
  },

  // Simulate payment (for testing)
  async simulatePayment(paymentData) {
    const response = await api.post('/payments/simulate/', paymentData);
    return response.data;
  },

  // Enhanced payment simulation
  async simulateEnhancedPayment(paymentData) {
    const response = await api.post('/payments/simulate-enhanced/', paymentData);
    return response.data;
  },

  // Get tenant balance
  async getTenantBalance(tenantId) {
    const response = await api.get(`/payments/tenant/${tenantId}/balance/`);
    return response.data;
  },

  // Get payment reminders
  async getReminders(landlordId) {
    const response = await api.get('/payments/reminders/', {
      params: { landlord_id: landlordId }
    });
    return response.data;
  },

  // Validate account number
  async validateAccount(accountNumber) {
    const response = await api.get(`/payments/validate-account/${accountNumber}/`);
    return response.data;
  },

  // Get recent payments for dashboard
  async getRecentPayments(landlordId, options = {}) {
    const params = { landlord_id: landlordId, ...options };
    const response = await api.get('/payments/recent/', { params });
    return response.data;
  }
};

// ===== PAYMENT HISTORY & ANALYTICS =====
export const paymentAPI = {
  // Get all payments for landlord
  async getPayments(landlordId, filters = {}) {
    const params = { landlord_id: landlordId, ...filters };
    const response = await api.get('/payments/', { params });
    return response.data;
  },

  // Get payment history for tenant
  async getPaymentHistory(tenantId) {
    const response = await api.get(`/payments/history/${tenantId}/`);
    return response.data;
  }
};

// ===== LANDLORD MANAGEMENT =====
export const landlordAPI = {
  // Get notifications
  async getNotifications() {
    const response = await api.get('/notifications/');
    return response.data;
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read/`);
    return response.data;
  },

  // Update password
  async updatePassword(passwordData) {
    const response = await api.put('/auth/password-change/', passwordData);
    return response.data;
  },

  // Get profile
  async getProfile() {
    const response = await api.get('/auth/profile/');
    return response.data;
  }
};

// Export alias for consistent naming
export const enhancedLandlordAPI = landlordAPI;

// ===== ANALYTICS & DASHBOARD =====
export const analyticsAPI = {
  // Get dashboard data
  async getDashboardData(landlordId) {
    try {
      const response = await api.get('/analytics/dashboard/', {
        params: { landlord_id: landlordId }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }
};

// Export default API object with all services
export default {
  enhancedPropertyAPI,
  enhancedTenantAPI,
  enhancedPaymentAPI,
  paymentAPI,
  landlordAPI,
  enhancedLandlordAPI,
  analyticsAPI
};

// Also export individual services for direct import
export {
  enhancedPropertyAPI as propertyService,
  enhancedTenantAPI as tenantService,
  enhancedPaymentAPI as paymentService,
  analyticsAPI as analyticsService
};