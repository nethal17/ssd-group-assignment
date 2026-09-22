import Stripe from 'stripe';
import dotenv from 'dotenv';
import { Payment } from '../models/payment.model.js';
import { Driver } from '../models/driver.model.js';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Create payment record
      const payment = await Payment.create({
        driverId: session.metadata.driverId,
        driverName: session.metadata.driverName,
        payAmount: session.amount_total / 100,
      });

      // Update driver's total salar
      await Driver.findByIdAndUpdate(
        session.metadata.driverId,
        { $inc: { totalSalary: session.amount_total / 100 } },
        { new: true }
      );

      console.log('Payment processed successfully:', payment);
    } catch (err) {
      console.error('Failed to save payment:', err);
    }
  }

  res.json({ received: true });
};