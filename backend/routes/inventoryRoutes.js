import express from 'express';
import Inventory from '../models/Inventory.js';
import Notification from '../models/Notifications.js';
import { sendNotificationEmail } from '../utils/emailService.js';
import { User } from '../models/user.js';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Farmer lists agri-waste
router.post('/addproduct', authMiddleware, async (req, res) => {
  try {
    // Extract farmerId from the authenticated user
    const farmerId = req.user.id; // Assuming `req.user` is set by authMiddleware

    const { productName, description, quantity, price, photo, expireDate } = req.body;

    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    // Validate expireDate (must be in the future)
    if (new Date(expireDate) <= new Date()) {
      return res.status(400).json({ message: 'Expire date must be in the future' });
    }

    // Create a new inventory item
    const newInventory = new Inventory({
      farmerId,
      productName,
      description,
      quantity,
      price,
      photo,
      expireDate,
      status: 'pending',
    });
    await newInventory.save();

    // Notify farmer that the product is under review
    const notification = new Notification({
      userId: farmerId,
      message: 'Your product is under review.',
    });
    await notification.save();

    // Send email notification
    const farmer = await User.findById(farmerId);
    await sendNotificationEmail(farmer.email, 'Your product is under review.');

    res.status(201).json(newInventory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Backend route to fetch pending products
router.get('/pending', async (req, res) => {
  try {
    const pendingProducts = await Inventory.find({ status: 'pending' }).populate('farmerId', 'email');
    res.status(200).json(pendingProducts);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Inventory manager approves product
router.put('/approve/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the inventory item
    const inventoryItem = await Inventory.findById(id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Update status to approved
    inventoryItem.status = 'approved';
    await inventoryItem.save();

    // Add the product to the Product collection (optional)
    const newProduct = new Product({
      name: inventoryItem.productName,
      type: 'Agri-Waste', // You can customize this
      quantity: inventoryItem.quantity,
      price: inventoryItem.price,
    });
    await newProduct.save();

    // Notify farmer that the product is approved
    const notification = new Notification({
      userId: inventoryItem.farmerId,
      message: 'Your product has been approved.',
    });
    await notification.save();

    // Send email notification
    const farmer = await User.findById(inventoryItem.farmerId);
    await sendNotificationEmail(farmer.email, 'Your product has been approved.');

    res.status(200).json(inventoryItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Backend route to fetch approved products
router.get('/approved', async (req, res) => {
  try {
    const approvedProducts = await Inventory.find({ status: 'approved' }).populate('farmerId', 'email'); // Populate farmer details if needed
    res.status(200).json(approvedProducts);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Inventory manager edits product
router.put('/edit/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const inventoryItem = await Inventory.findByIdAndUpdate(id, updates, { new: true });
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.status(200).json(inventoryItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Inventory manager deletes product
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const inventoryItem = await Inventory.findByIdAndDelete(id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.status(200).json({ message: 'Inventory item deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Generate inventory reports
router.get('/reports', async (req, res) => {
  try {
    const { status, farmerId, startDate, endDate } = req.query;
    const filters = {};

    if (status) filters.status = status;
    if (farmerId) filters.farmerId = farmerId;
    if (startDate && endDate) {
      filters.listingDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const inventoryItems = await Inventory.find(filters);

    // Calculate total inventory value
    const totalValue = inventoryItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

    res.status(200).json({ inventoryItems, totalValue });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/getProductIds/:farmerId',async (req, res) => {
  try {
    const { farmerId } = req.params;

    // Validate farmerId
    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return res.status(400).json({ message: 'Invalid farmer ID.' });
    }

    // Find products associated with the farmer and return only their IDs
    const products = await Inventory.find({ farmerId }).select('_id');

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found for this farmer.' });
    }

    // Extract product IDs
    const productIds = products.map(product => product._id);

    res.status(200).json(productIds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;