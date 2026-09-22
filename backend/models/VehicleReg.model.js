import mongoose from "mongoose";

const vehicleRegSchema = new mongoose.Schema({
  nic: { type: String, required: true },
  licenseNumber: { type: String, required: true },
  licenseExpiry: { type: Date, required: true },
  address: { type: String, required: true },
  preferredDistrict: { type: String, required: true },
  vehicleType: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const VehicleReg = mongoose.model("VehicleReg", vehicleRegSchema);