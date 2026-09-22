import OrderHistory from '../models/orderHistory.model.js';
import Delivery from '../models/Delivery.js';
import { User } from '../models/user.js';
import mongoose from 'mongoose';

export const addDelivery = async (req, res) => {
    try {
        const { userId, productId, farmerId, productName, quantity } = req.body;

        // Validate IDs
       if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(farmerId)) {
            return res.status(400).json({ message: 'Invalid IDs provided.' });
        }

        // Check if the user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Driver not found.' });
        }

        // Create a new delivery record
        const newDelivery = new Delivery({
            userId,
            productId,
            farmerId,
            productName,
            quantity,
            deliveryStatus: 'pending'
        });

        await newDelivery.save();
        res.status(201).json({ message: 'Delivery added successfully.', delivery: newDelivery });
    } catch (error) {
        console.error('Error adding delivery:', error);
        res.status(500).json({ message: 'Failed to add delivery.', error: error.message });
    }
} 

// Get completed deliveries
export const getCompletedDeliveries = async (req, res) => {
    try {
        console.log('Fetching completed deliveries');
        const deliveries = await Delivery.find({ 
            deliveryStatus: 'completed'
        })
        .populate('userId', 'name email _id')
        .populate('productId', 'productName')
        .populate('farmerId', 'name email');
        
        console.log('Found deliveries:', deliveries);
        res.status(200).json(deliveries);
    } catch (error) {
        console.error('Error in getCompletedDeliveries:', error);
        res.status(500).json({ 
            message: 'Failed to fetch completed deliveries.', 
            error: error.message 
        });
    }
}

// Get all deliveries
export const getAllDeliveries = async (req, res) => {
    try {
        const deliveries = await Delivery.find().populate('userId', 'name email').populate('productId', 'productName');
        res.status(200).json(deliveries);
    } catch (error) {
        console.error('Error fetching all deliveries:', error);
        res.status(500).json({ message: 'Failed to fetch all deliveries.', error: error.message });
    }
}

// Get delivery by ID
export const getDeliveryById = async (req, res) => {
    try {
        const { deliveryId } = req.params;

        // Validate deliveryId
        if (!mongoose.Types.ObjectId.isValid(deliveryId)) {
            return res.status(400).json({ message: 'Invalid delivery ID.' });
        }

        const delivery = await Delivery.findById(deliveryId).populate('userId', 'name email').populate('productId', 'productName');

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found.' });
        }

        res.status(200).json(delivery);
    } catch (error) {
        console.error('Error fetching delivery:', error);
        res.status(500).json({ message: 'Failed to fetch delivery.', error: error.message });
    }
}

// Update delivery status
export const updateDeliveryStatus = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const { deliveryStatus } = req.body;

        // Validate deliveryId
        if (!mongoose.Types.ObjectId.isValid(deliveryId)) {
            return res.status(400).json({ message: 'Invalid delivery ID.' });
        }

        const updatedDelivery = await Delivery.findByIdAndUpdate(
            deliveryId,
            { deliveryStatus },
            { new: true }
        ).populate('userId', 'name email').populate('productId', 'productName');

        if (!updatedDelivery) {
            return res.status(404).json({ message: 'Delivery not found.' });
        }

        res.status(200).json({ message: 'Delivery status updated successfully.', delivery: updatedDelivery });
    } catch (error) {
        console.error('Error updating delivery status:', error);
        res.status(500).json({ message: 'Failed to update delivery status.', error: error.message });
    }
}

// Get delivery by user ID
export const getDeliveriesByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID.' });
        }

        const deliveries = await Delivery.find({ userId }).populate('userId', 'name email').populate('productId', 'productName');

        if (deliveries.length === 0) {
            return res.status(404).json({ message: 'No deliveries found for this user.' });
        }

        res.status(200).json(deliveries);
    } catch (error) {
        console.error('Error fetching deliveries:', error);
        res.status(500).json({ message: 'Failed to fetch deliveries.', error: error.message });
    }
}
