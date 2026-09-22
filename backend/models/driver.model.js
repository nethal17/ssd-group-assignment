import mongoose from 'mongoose';

const driverSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: String, 
      required: true,
    },
    totalSalary: {
      type: Number,
      default: 0,
    },
    deliveryCount: {  // Add this field
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Driver = mongoose.model('Driver', driverSchema);