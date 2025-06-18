// frontend/src/services/enhancedApiService.js
import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['authorization-uid'] = user.uid;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ===== ENHANCED PROPERTY MANAGEMENT =====
export const enhancedPropertyAPI = {
  // Create property with unit types
  async createProperty(propertyData, landlordId) {
    const response = await api.post('/enhanced/properties', {
      ...propertyData,
      landlordId
    });
    return response.data;
  },

  // Get all properties for landlord
  async getProperties(landlordId) {
    const response = await api.get(`/enhanced/properties/landlord/${landlordId}`);
    return response.data;
  },

  // Get single property
  async getProperty(propertyId) {
    const response = await api.get(`/enhanced/properties/${propertyId}`);
    return response.data;
  },

  // Update property
  async updateProperty(propertyId, propertyData) {
    const response = await api.put(`/enhanced/properties/${propertyId}`, propertyData);
    return response.data;
  },

  // Delete property
  async deleteProperty(propertyId) {
    const response = await api.delete(`/enhanced/properties/${propertyId}`);
    return response.data;
  },

  // Get unit types for property
  async getUnitTypes(propertyId) {
    const response = await api.get(`/enhanced/properties/${propertyId}/unit-types`);
    return response.data;
  },

  // Get available units for property by type
  async getAvailableUnits(propertyId, unitType = null) {
    const params = unitType ? { unitType } : {};
    const response = await api.get(`/enhanced/properties/${propertyId}/available-units`, { params });
    return response.data;
  }
};

// ===== ENHANCED TENANT MANAGEMENT =====
export const enhancedTenantAPI = {
  // Create tenant with auto-assignment
  async createTenant(tenantData, landlordId) {
    const response = await api.post('/enhanced/tenants', {
      ...tenantData,
      landlordId
    });
    return response.data;
  },

  // Get all tenants for landlord
  async getTenants(landlordId, filters = {}) {
    const params = { ...filters };
    const response = await api.get(`/enhanced/tenants/landlord/${landlordId}`, { params });
    return response.data;
  },

  // Get single tenant
  async getTenant(tenantId) {
    const response = await api.get(`/enhanced/tenants/${tenantId}`);
    return response.data;
  },

  // Update tenant
  async updateTenant(tenantId, tenantData) {
    const response = await api.put(`/enhanced/tenants/${tenantId}`, tenantData);
    return response.data;
  },

  // Delete tenant
  async deleteTenant(tenantId) {
    const response = await api.delete(`/enhanced/tenants/${tenantId}`);
    return response.data;
  },

  // Move tenant out
  async moveTenantOut(tenantId, moveOutDate = null) {
    const response = await api.post(`/enhanced/tenants/${tenantId}/move-out`, {
      moveOutDate
    });
    return response.data;
  },

  // Transfer tenant
  async transferTenant(tenantId, transferData) {
    const response = await api.post(`/enhanced/tenants/${tenantId}/transfer`, transferData);
    return response.data;
  },

  // Get tenant by account number
  async getTenantByAccountNumber(accountNumber) {
    const response = await api.get(`/enhanced/tenants/account/${accountNumber}`);
    return response.data;
  },

  // Get tenant payment summary
  async getTenantPaymentSummary(tenantId) {
    const response = await api.get(`/enhanced/tenants/${tenantId}/payment-summary`);
    return response.data;
  },

  // Get tenant statistics
  async getTenantStatistics(landlordId) {
    const response = await api.get(`/enhanced/tenants/landlord/${landlordId}/statistics`);
    return response.data;
  }
};

// ===== ENHANCED PAYMENT SYSTEM =====
export const enhancedPaymentAPI = {
  // Initiate M-Pesa payment
  async initiatePayment(paymentData) {
    const response = await api.post('/enhanced/payments/initiate', paymentData);
    return response.data;
  },

  // Simulate payment (for testing)
  async simulatePayment(paymentData) {
    const response = await api.post('/enhanced/payments/simulate-payment', paymentData);
    return response.data;
  },

  // Enhanced payment simulation
  async simulateEnhancedPayment(paymentData) {
    const response = await api.post('/enhanced/payments/simulate-enhanced', paymentData);
    return response.data;
  },

  // Get tenant balance
  async getTenantBalance(tenantId) {
    const response = await api.get(`/enhanced/payments/tenant/${tenantId}/balance`);
    return response.data;
  },

  // Get payment reminders
  async getReminders(landlordId) {
    const response = await api.get(`/enhanced/payments/reminders/${landlordId}`);
    return response.data;
  },

  // Test payment scenarios
  async testPaymentScenarios(scenarioData) {
    const response = await api.post('/enhanced/payments/test-scenarios', scenarioData);
    return response.data;
  },

  // Validate account number
  async validateAccount(accountNumber) {
    const response = await api.get(`/enhanced/payments/validate-account/${accountNumber}`);
    return response.data;
  },

  // Get test tenants for enhanced payments
  async getTestTenants(landlordId) {
    const response = await api.get(`/enhanced/payments/test-tenants-enhanced/${landlordId}`);
    return response.data;
  },

  // Get recent payments for dashboard
  async getRecentPayments(landlordId, options = {}) {
    const params = { landlordId, ...options };
    const response = await api.get('/enhanced/payments/recent', { params });
    return response.data;
  }
};

// ===== PAYMENT HISTORY & ANALYTICS =====
export const paymentAPI = {
  // Get all payments for landlord
  async getPayments(landlordId, filters = {}) {
    const params = { landlordId, ...filters };
    const response = await api.get('/payments', { params });
    return response.data;
  },

  // Get payment history for tenant
  async getPaymentHistory(tenantId) {
    const response = await api.get(`/payments/history/${tenantId}`);
    return response.data;
  },

  // Test M-Pesa OAuth
  async testOAuth() {
    const response = await api.get('/payments/test-oauth');
    return response.data;
  },

  // Test STK Push
  async testPayment(testData) {
    const response = await api.post('/payments/test-payment', testData);
    return response.data;
  },

  // Get test tenants list
  async getTestTenants(landlordId) {
    const params = { landlordId };
    const response = await api.get('/payments/test-tenants', { params });
    return response.data;
  },

  // Mock successful payment
  async mockSuccessfulPayment() {
    const response = await api.post('/payments/mock-success');
    return response.data;
  },

  // Test callback flow
  async testCallbackFlow(callbackData) {
    const response = await api.post('/payments/test-callback-flow', callbackData);
    return response.data;
  }
};

// ===== LANDLORD MANAGEMENT =====
export const landlordAPI = {
  // Get notifications
  async getNotifications() {
    const response = await api.get('/landlords/notifications');
    return response.data;
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    const response = await api.patch(`/landlords/notifications/${notificationId}/read`);
    return response.data;
  },

  // Update password
  async updatePassword(passwordData) {
    const response = await api.put('/landlords/password', passwordData);
    return response.data;
  },

  // Get profile
  async getProfile() {
    const response = await api.get('/landlords/profile');
    return response.data;
  }
};

// Export alias for consistent naming
export const enhancedLandlordAPI = landlordAPI;

// ===== REMINDER SYSTEM =====
export const reminderAPI = {
  // Send rent reminders
  async sendRentReminders() {
    const response = await api.post('/reminders/send-reminders');
    return response.data;
  }
};

// ===== ANALYTICS & DASHBOARD =====
export const analyticsAPI = {
  // Get dashboard data
  async getDashboardData(landlordId) {
    try {
      // Get data from multiple enhanced endpoints
      const [properties, tenants, tenantStats] = await Promise.all([
        enhancedPropertyAPI.getProperties(landlordId),
        enhancedTenantAPI.getTenants(landlordId, { isActive: true }),
        enhancedTenantAPI.getTenantStatistics(landlordId)
      ]);

      // Calculate analytics locally (similar to your current firestoreService)
      const totalProperties = properties.data?.length || 0;
      const totalTenants = tenants.data?.length || 0;
      
      const totalUnits = properties.data?.reduce((sum, p) => {
        return sum + (p.totalUnits || 0);
      }, 0) || 0;
      
      const occupiedUnits = properties.data?.reduce((sum, p) => {
        return sum + (p.occupiedUnits || 0);
      }, 0) || 0;
      
      const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0;
      
      const monthlyRevenue = properties.data?.reduce((sum, p) => {
        return sum + (p.monthlyRevenue || 0);
      }, 0) || 0;

      const stats = tenantStats.data || {};

      return {
        success: true,
        data: {
          totalProperties,
          totalTenants,
          totalUnits,
          occupiedUnits,
          occupancyRate: parseFloat(occupancyRate),
          monthlyRevenue,
          paidTenants: stats.paymentStatus?.paid || 0,
          pendingPayments: stats.paymentStatus?.pending || 0,
          overduePayments: stats.paymentStatus?.overdue || 0,
          partialPayments: stats.paymentStatus?.partial || 0,
          collectionRate: stats.paymentStatus ? 
            ((stats.paymentStatus.paid / stats.active) * 100).toFixed(1) : 0,
          properties: properties.data || [],
          tenants: tenants.data || [],
          recentPayments: [] // Will be populated when payment history is implemented
        }
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }
};

// ===== ORIGINAL TENANT ROUTES (for backward compatibility) =====
export const originalTenantAPI = {
  // Get all tenants (original format)
  async getAllTenants() {
    const response = await api.get('/tenants');
    return response.data;
  },

  // Add tenant (original format)
  async addTenant(tenantData) {
    const response = await api.post('/tenants', tenantData);
    return response.data;
  },

  // Update tenant (original format)
  async updateTenant(tenantId, tenantData) {
    const response = await api.put(`/tenants/${tenantId}`, tenantData);
    return response.data;
  },

  // Delete tenant (original format)
  async deleteTenant(tenantId) {
    const response = await api.delete(`/tenants/${tenantId}`);
    return response.data;
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
  reminderAPI,
  analyticsAPI,
  originalTenantAPI
};

// Also export individual services for direct import
export {
  enhancedPropertyAPI as propertyService,
  enhancedTenantAPI as tenantService,
  enhancedPaymentAPI as paymentService,
  analyticsAPI as analyticsService
};