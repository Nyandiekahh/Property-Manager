import api from './api';

// Property Management
export const getProperties = () => api.get('/landlord/properties');
export const createProperty = (propertyData) => api.post('/landlord/properties', propertyData);
export const updateProperty = (id, propertyData) => api.put(`/landlord/properties/${id}`, propertyData);
export const deleteProperty = (id) => api.delete(`/landlord/properties/${id}`);

// Tenant Management
export const getTenants = (propertyId = null) => {
  const url = propertyId ? `/landlord/tenants?propertyId=${propertyId}` : '/landlord/tenants';
  return api.get(url);
};
export const createTenant = (tenantData) => api.post('/landlord/tenants', tenantData);
export const updateTenant = (id, tenantData) => api.put(`/landlord/tenants/${id}`, tenantData);
export const deleteTenant = (id) => api.delete(`/landlord/tenants/${id}`);

// Payment Management
export const getPayments = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return api.get(`/payments?${params}`);
};
export const getPaymentHistory = (tenantId) => api.get(`/payments/history/${tenantId}`);

// Email Notifications
export const sendRentReminder = (tenantId, message) => 
  api.post('/notifications/rent-reminder', { tenantId, message });

// Dashboard Analytics
export const getDashboardData = () => api.get('/landlord/dashboard');
export const getAnalytics = (period = 'month') => api.get(`/landlord/analytics?period=${period}`);