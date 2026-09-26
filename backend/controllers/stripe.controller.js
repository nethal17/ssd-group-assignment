import Stripe from 'stripe';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

// Removed the plain console.log of STRIPE_SECRET_KEY
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  // Redacted payload logging
  logger.info({ body: req.body }, 'Received createCheckoutSession request');
  
  const { totalSalary, driverId, driverName } = req.body;

  // Validate inputs
  if (!totalSalary || !driverId || !driverName) {
    logger.warn({ driverId, driverName }, 'Missing required fields for checkout session');
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (isNaN(totalSalary) || totalSalary <= 0) {
    logger.warn({ driverId }, 'Invalid amount for checkout session');
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    logger.info({ driverId }, 'Creating Stripe session');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: `Salary Payment for ${driverName}`,
            },
            unit_amount: Math.round(totalSalary * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        driverId,
        driverName,
        type: 'driver',
      },
    });

    logger.info({ sessionId: session.id }, 'Stripe session created successfully');
    res.json({ url: session.url });
  } catch (error) {
    logger.error(error, 'Stripe error during checkout session creation');
    res.status(500).json({ 
      error: 'Failed to create payment session',
      details: error.message 
    });
  }
};