import mongoose from 'mongoose';

const paymentSchema = mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver', // Reference to the Driver model
      required: true,
    },
    driverName: {
      type: String,
      required: true,
    },
    payAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

export const Payment = mongoose.model('Payment', paymentSchema);