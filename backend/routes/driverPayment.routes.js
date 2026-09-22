import express from 'express';
import { createDriverPaymentSession, createFarmerPaymentSession } from '../controllers/stripePayment.controller.js';

const router = express.Router();

// Route for creating a driver payment session
router.post('/driver-payment', createDriverPaymentSession);

// Route for creating a farmer payment session
router.post('/stripe/farmer-payment', createFarmerPaymentSession);

export default router; 