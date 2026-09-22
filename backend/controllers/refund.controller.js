import Refund from "../models/refund.model.js";
import mongoose from "mongoose";

export const createRefund = async (req, res) => {
  try {
    const { userId, productName, quantity, totalPrice, orderDate, canceledDate, refundStatus, refundReason } = req.body;

    // Log received data for debugging
    console.log('Received refund data:', req.body);

    // Validate required fields
    const missingFields = [];
    if (!userId) missingFields.push('userId');
    if (!productName) missingFields.push('productName');
    if (!quantity) missingFields.push('quantity');
    if (!totalPrice) missingFields.push('totalPrice');
    if (!orderDate) missingFields.push('orderDate');
    if (!refundStatus) missingFields.push('refundStatus');
    if (!refundReason) missingFields.push('refundReason');

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: "Missing required fields",
        missingFields,
        received: req.body
      });
    }

    // Create refund record
    const refund = new Refund({
      userId: new mongoose.Types.ObjectId(userId),
      productName,
      quantity: Number(quantity),
      totalPrice: Number(totalPrice),
      orderDate: new Date(orderDate),
      refundReason,
      refundStatus: refundStatus || "pending"
    });

    // Save the refund record
    await refund.save();

    res.status(201).json({
      message: "Refund created successfully",
      refund
    });
  } catch (error) {
    console.error("Error in createRefund:", error);
    res.status(500).json({ 
      message: "Error creating refund",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

export const getRefunds = async (req, res) => {
  try {
    const refunds = await Refund.find()
      .populate('userId', 'name email');
    res.status(200).json(refunds);
  } catch (error) {
    console.error("Error fetching refunds:", error);
    res.status(500).json({ message: "Error fetching refunds" });
  }
};

export const updateRefundStatus = async (req, res) => {
  try {
    const { refundId } = req.params;
    const { status } = req.body;

    const refund = await Refund.findByIdAndUpdate(
      refundId,
      { refundStatus: status },
      { new: true }
    );

    if (!refund) {
      return res.status(404).json({ message: "Refund not found" });
    }

    res.status(200).json({
      message: "Refund status updated successfully",
      refund
    });
  } catch (error) {
    console.error("Error updating refund status:", error);
    res.status(500).json({ message: "Error updating refund status" });
  }
}; 

export const deleteRefund = async (req, res) => {
  try {
    const { refundId } = req.params;
    const refund = await Refund.findByIdAndDelete(refundId);

    if (!refund) {
      return res.status(404).json({ message: "Refund not found" });
    }

    res.status(200).json({
      message: "Refund deleted successfully",
      refund
    });
  } catch (error) {
    console.error("Error deleting refund:", error);
    res.status(500).json({ message: "Error deleting refund" });
  }
}; 