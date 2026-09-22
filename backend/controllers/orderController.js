import Order from '../models/Order.js';
import mongoose from 'mongoose';

// Add a new order
export const addOrder = async (req, res) => {
  try {
    const { buyerId, productId, quantity, totalPrice } = req.body;

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(buyerId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid buyerId or productId' });
    }

    // Create a new order
    const newOrder = new Order({
      buyerId,
      productId,
      quantity,
      totalPrice,
    });

    await newOrder.save();

    res.status(201).json({ message: 'Order created successfully.', order: newOrder });
  } catch (error) {
    console.error('Error adding order:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all orders for a specific user
export const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    // Find all orders for the user
    const orders = await Order.find({ buyerId: userId })
    .populate({
      path: 'productId',
      select: 'wasteItem description price', // Select the fields you need
      model: 'Marketplace'
    })
    .exec();

  res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getOrderIdByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid userId' 
      });
    }

    // Find all orders for the user and return only IDs
    const orders = await Order.find({ buyerId: userId }).select('_id');

    // Extract just the ID strings from the documents
    //const orderIds = orders.map(order => order._id.toString());

    res.status(200).json({orders});

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch order IDs',
      error: error.message 
    });
  }
};