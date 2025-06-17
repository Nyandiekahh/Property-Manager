import express from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  updatePassword,
  getProfile
} from '../controllers/landlordController.js';

const router = express.Router();

// GET /api/landlords/notifications
router.get('/notifications', getNotifications);

// PATCH /api/landlords/notifications/:id/read
router.patch('/notifications/:id/read', markNotificationAsRead);

// PUT /api/landlords/password
router.put('/password', updatePassword);

// GET /api/landlords/profile
router.get('/profile', getProfile);

export default router;
