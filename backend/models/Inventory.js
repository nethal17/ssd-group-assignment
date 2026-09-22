import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productName: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  photo: { type: String }, // URL or file path
  listingDate: { type: Date, default: Date.now },
  expireDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
});

// Export the model
const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;

