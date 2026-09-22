import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderHistory', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  productName: { type: String, required: true, trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, required: true },
  status: { type: String, enum: ['pending', 'published'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;