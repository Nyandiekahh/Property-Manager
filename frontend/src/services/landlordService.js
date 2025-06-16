import { 
  propertyService, 
  tenantService, 
  paymentService, 
  analyticsService 
} from './firestoreService';

// Property Management
export const getProperties = (landlordId) => propertyService.getProperties(landlordId);
export const createProperty = (propertyData, landlordId) => propertyService.createProperty(propertyData, landlordId);
export const updateProperty = (id, propertyData) => propertyService.updateProperty(id, propertyData);
export const deleteProperty = (id) => propertyService.deleteProperty(id);

// Tenant Management
export const getTenants = (landlordId, propertyId = null) => tenantService.getTenants(landlordId, propertyId);
export const createTenant = (tenantData, landlordId) => tenantService.createTenant(tenantData, landlordId);
export const updateTenant = (id, tenantData) => tenantService.updateTenant(id, tenantData);
export const deleteTenant = (id) => tenantService.deleteTenant(id);

// Payment Management
export const getPayments = (landlordId, filters = {}) => paymentService.getPayments(landlordId, filters);
export const getPaymentHistory = (tenantId) => paymentService.getPaymentHistory(tenantId);

// Dashboard Analytics
export const getDashboardData = (landlordId) => analyticsService.getDashboardData(landlordId);

// Email Notifications (to be implemented with Firebase Functions)
export const sendRentReminder = async (tenantId, message) => {
  // This will be implemented with Firebase Functions for sending emails
  console.log('Sending rent reminder to tenant:', tenantId, message);
  // For now, return a promise
  return Promise.resolve({ success: true, message: 'Reminder sent' });
};