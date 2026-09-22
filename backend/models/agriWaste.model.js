import mongoose from "mongoose";

// Define the schema
const agriWasteSchema = new mongoose.Schema({
  waste_type: { 
    type: String,
    required: true 
  },
  district: {
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  expire_date: {
    type: Date, 
    required: true
  },
});

// Use default export
const AgriWaste = mongoose.model("AgriWaste", agriWasteSchema);
export default AgriWaste;  // Change to default export

