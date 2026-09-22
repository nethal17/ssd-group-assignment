import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();
console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  console.log('Received request body:', req.body);
  const { totalSalary, driverId, driverName } = req.body;

  // Validate inputs
  if (!totalSalary || !driverId || !driverName) {
    console.log('Missing fields:', { totalSalary, driverId, driverName });
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (isNaN(totalSalary) || totalSalary <= 0) {
    console.log('Invalid amount:', totalSalary);
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    console.log('Creating Stripe session with:', {
      totalSalary,
      driverId,
      driverName,
      currency: 'lkr',
      amount: Math.round(totalSalary * 100)
    });

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

    console.log('Stripe session created:', session.id);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ 
      error: 'Failed to create payment session',
      details: error.message 
    });
  }
};