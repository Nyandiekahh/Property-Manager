import { initiatePayment, handleCallback } from '../services/darajaService.js';

export async function startPayment(req, res) {
  try {
    const paymentData = req.body;
    const response = await initiatePayment(paymentData);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function paymentCallback(req, res) {
  try {
    const callbackData = req.body;
    await handleCallback(callbackData);
    res.status(200).send('Callback received');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
