import express from 'express';
import { createPayment, getAllPayments } from '../controllers/payment.controller.js';
import Stripe from 'stripe';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


router.post('/payments', createPayment);
router.get('/payments', getAllPayments);

// Add new Stripe route with a distinct name
router.post('/stripe/checkout', async (req, res) => {
  try {
    const { userId, cartId, line_items, currency, success_url, cancel_url, customerEmail } = req.body;

    if (!line_items || line_items.length === 0) {
      return res.status(400).json({ error: 'No items in cart' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: success_url || `${process.env.CLIENT_URL}/success`,
      cancel_url: cancel_url || `${process.env.CLIENT_URL}/cancel`,
      customer_email: customerEmail,
      metadata: {
        userId: userId,
        cartId: cartId
      }
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Webhook handler for successful payments
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, cartId } = session.metadata;

    try {
      // Clear the user's cart
      await Cart.findByIdAndUpdate(cartId, {
        $set: { items: [], totalPrice: 0 }
      });

      console.log('Payment successful and cart cleared for user:', userId);
      
      // Create order record
      const order = new Order({
        userId: userId,
        items: session.line_items.data,
        totalAmount: session.amount_total / 100, // Convert from cents to dollars
        paymentStatus: 'completed',
        stripeSessionId: session.id
      });
      await order.save();

      console.log('Order created:', order._id);
    } catch (error) {
      console.error('Error processing webhook:', error);
      return res.status(500).json({ error: 'Error processing webhook' });
    }
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

export default router;