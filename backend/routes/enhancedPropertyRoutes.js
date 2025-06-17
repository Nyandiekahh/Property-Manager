// backend/routes/enhancedPropertyRoutes.js
import express from 'express';
import { 
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  getUnitTypes,
  getAvailableUnits
} from '../controllers/enhancedPropertyController.js';

const router = express.Router();

// Property CRUD operations
router.post('/', createProperty);
router.get('/landlord/:landlordId', getProperties);
router.get('/:propertyId', getProperty);
router.put('/:propertyId', updateProperty);
router.delete('/:propertyId', deleteProperty);

// Unit management
router.get('/:propertyId/unit-types', getUnitTypes);
router.get('/:propertyId/available-units', getAvailableUnits);

export default router;