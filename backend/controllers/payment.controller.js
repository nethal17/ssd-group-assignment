import { Payment } from '../models/payment.model.js';

export const createPayment = async (req, res) => {
  const { driverId, driverName, payAmount } = req.body;

  try {
    const payment = await Payment.create({ driverId, driverName, payAmount });
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 }); 
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { userId, cartId, amount, currency } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: currency.toLowerCase() || 'lkr',
          product_data: {
            name: 'Organic Waste Purchase',
          },
          unit_amount: Math.round(amount),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cart`,
      metadata: {
        userId,
        cartId
      }
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
};