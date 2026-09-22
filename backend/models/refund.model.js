import mongoose from "mongoose";

const RefundSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
  },
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  orderDate: {
    type: Date,
    required: true,
  },
  canceledDate: {
    type: Date,
    default: Date.now,
  },
  refundStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  refundReason: {
    type: String,
    required: true,
    trim: true,
  }
});

const Refund = mongoose.model("Refund", RefundSchema);

export default Refund; 