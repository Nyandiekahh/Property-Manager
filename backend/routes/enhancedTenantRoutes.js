// backend/routes/enhancedTenantRoutes.js - Enhanced with Email Endpoints
import express from 'express';
import { 
  createTenant,
  getTenants,
  getTenant,
  updateTenant,
  moveTenantOut,
  transferTenant,
  deleteTenant,
  getTenantByAccountNumber,
  getTenantPaymentSummary,
  getTenantStatistics,
  sendRentReminder,
  sendBulkRentReminders
} from '../controllers/enhancedTenantController.js';

const router = express.Router();

// Tenant CRUD operations
router.post('/', createTenant);
router.get('/landlord/:landlordId', getTenants);
router.get('/:tenantId', getTenant);
router.put('/:tenantId', updateTenant);
router.delete('/:tenantId', deleteTenant);

// Tenant management operations
router.post('/:tenantId/move-out', moveTenantOut);
router.post('/:tenantId/transfer', transferTenant);

// Tenant lookup and analytics
router.get('/account/:accountNumber', getTenantByAccountNumber);
router.get('/:tenantId/payment-summary', getTenantPaymentSummary);
router.get('/landlord/:landlordId/statistics', getTenantStatistics);

// Email notification endpoints
router.post('/:tenantId/send-reminder', sendRentReminder);
router.post('/landlord/:landlordId/send-bulk-reminders', sendBulkRentReminders);

export default router;