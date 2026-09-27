import Refund from "../models/refund.model.js";
import mongoose from "mongoose";

export const createRefund = async (req, res) => {
  try {
    // Body is validated by createRefundBody. Status is never taken from the client:
    // every new refund starts as pending and only the status endpoint moves it on.
    const { userId, productName, quantity, totalPrice, orderDate, refundReason } = req.body;

    const refund = new Refund({
      userId: new mongoose.Types.ObjectId(userId),
      productName,
      quantity,
      totalPrice,
      orderDate,
      refundReason,
      refundStatus: "pending"
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
      { new: true, runValidators: true }
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