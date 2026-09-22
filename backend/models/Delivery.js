import mongoose from "mongoose";

const DeliverySchema = new mongoose.Schema({
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
  deliveryStatus: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },
});

export const Delivery = mongoose.model("Delivery", DeliverySchema);

export default Delivery;




