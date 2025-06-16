import express from 'express';
import { startPayment, paymentCallback } from '../controllers/paymentController.js';

const router = express.Router();

// Route to initiate payment
router.post('/initiate', startPayment);

// Route for Daraja callback webhook
router.post('/callback', paymentCallback);

export default router;
