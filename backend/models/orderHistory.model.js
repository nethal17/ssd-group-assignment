import mongoose from "mongoose";

const OrderHistorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true,
  },
  productId: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  farmerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true
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
    default: Date.now,
  },
  orderStatus: {
    type: String,
    enum: ["toDeliver", "toReceive", "toReview"],
    default: "toDeliver",
  },
});

const OrderHistory = mongoose.model("OrderHistory", OrderHistorySchema);

export default OrderHistory;




