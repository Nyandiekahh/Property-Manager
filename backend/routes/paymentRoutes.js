import express from 'express';
import { initiatePayment, handleCallback, handleTimeout } from '../controllers/paymentController.js';

const router = express.Router();

// Route to initiate payment
router.post('/initiate', initiatePayment);

// Route for Daraja callback webhook
router.post('/callback', handleCallback);

// Route for Daraja timeout webhook
router.post('/timeout', handleTimeout);

export default router;