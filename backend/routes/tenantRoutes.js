import express from 'express';
import { getAllTenants, addTenant, updateTenant, deleteTenant } from '../controllers/tenantController.js';

const router = express.Router();

// GET all tenants
router.get('/', async (req, res) => {
  try {
    const tenants = await getAllTenants();
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new tenant
router.post('/', async (req, res) => {
  try {
    const id = await addTenant(req.body);
    res.status(201).json({ message: 'Tenant added', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update tenant by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedId = await updateTenant(req.params.id, req.body);
    res.json({ message: 'Tenant updated', id: updatedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE tenant by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedId = await deleteTenant(req.params.id);
    res.json({ message: 'Tenant deleted', id: deletedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
