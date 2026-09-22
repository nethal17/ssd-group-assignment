import express from 'express';
import { getStripePayments } from '../controllers/stripePayments.controller.js';

const router = express.Router();

// Define the route for fetching Stripe payments
router.get('/stripe-payments', getStripePayments);

export default router;