// backend/routes/enhancedTenantRoutes.js
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
  getTenantStatistics
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

export default router;