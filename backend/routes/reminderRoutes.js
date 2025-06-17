import express from 'express';
import { sendRentReminders } from '../controllers/reminderController.js';

const router = express.Router();

router.post('/send-reminders', sendRentReminders);

export default router;
