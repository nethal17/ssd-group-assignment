import mongoose from "mongoose";

// Define the schema
const CheckoutSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  district: { 
    type: String, 
    required: true 
  },
  city: { 
    type: String, 
    required: true 
  },
  streetNo: { 
    type: String, 
    required: true 
  },
  totalPrice: { 
    type: Number, 
    required: true 
  },
});

const Checkout = mongoose.model("Checkout", CheckoutSchema);
export default Checkout;