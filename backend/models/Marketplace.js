import mongoose from 'mongoose';

const MarketplaceSchema = new mongoose.Schema({
  wasteItem: { type: String, required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  district: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  expireDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Marketplace', MarketplaceSchema);