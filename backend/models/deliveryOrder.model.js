import mongoose from "mongoose";

const deliveryOrderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  productName: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["toDeliver", "toReceive", "completed"], 
    default: "toDeliver" 
  }
}, { timestamps: true });

const DeliveryOrder = mongoose.model("DeliveryOrder", deliveryOrderSchema);

export default DeliveryOrder; 