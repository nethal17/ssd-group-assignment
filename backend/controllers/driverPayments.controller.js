import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getDriverPayments = async (req, res) => {
  const { driverId } = req.params; // Get driverId from the request params

  try {
    // Fetch all checkout sessions from Stripe
    const sessions = await stripe.checkout.sessions.list({
      limit: 100, 
    });

    console.log('All sessions:', sessions.data); 

    // Filter sessions to include only driver payments 
    const driverPayments = sessions.data
      .filter(session => session.metadata.type === 'driver' && session.metadata.driverId === driverId)
      .map(session => ({
        id: session.id,
        driverName: session.metadata.driverName || 'Unknown', 
        payAmount: session.amount_total / 100, 
        paymentDate: new Date(session.created * 1000).toLocaleDateString(), 
      }));

    console.log('Filtered driver payments:', driverPayments); 

    res.status(200).json(driverPayments);
  } catch (error) {
    console.error('Error fetching driver payments:', error); 
    res.status(500).json({ error: error.message });
  }
};