import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest API version
});

export const createDriverPaymentSession = async (req, res) => {
  try {
    const { totalSalary, driverId, driverName } = req.body;
    
    console.log('Creating payment session for:', { driverName, totalSalary });
    
    // Validate inputs
    if (!totalSalary || !driverId || !driverName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'lkr',
            product_data: {
              name: `Salary Payment for ${driverName}`,
              description: `Payment for driver ${driverName}`,
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
    
    console.log('Session created successfully:', session.id);
    
    // Return the session URL to redirect the user
    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id
    });
    
  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment session',
      error: error.message
    });
  }
};

export const createFarmerPaymentSession = async (req, res) => {
  try {
    const { userId, amount, currency, success_url, cancel_url, customerEmail } = req.body;
    
    console.log('Creating farmer payment session for:', { userId, amount });
    
    // Validate inputs
    if (!userId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'lkr',
            product_data: {
              name: `Farmer Payment`,
              description: `Payment for farmer services`,
            },
            unit_amount: Math.round(amount), // Amount should already be in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url || `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${process.env.FRONTEND_URL}/cancel`,
      customer_email: customerEmail,
      metadata: {
        userId,
        type: 'farmer',
      },
    });
    
    console.log('Farmer payment session created successfully:', session.id);
    
    // Return the session URL to redirect the user
    return res.status(200).json({
      success: true,
      url: session.url,
      sessionId: session.id
    });
    
  } catch (error) {
    console.error('Stripe error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create payment session',
      error: error.message
    });
  }
}; 