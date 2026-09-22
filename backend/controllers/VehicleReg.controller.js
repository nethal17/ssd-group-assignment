import { User } from "../models/user.js";
import { VehicleReg as VehicleRegModel } from "../models/VehicleReg.model.js";  // <-- Renamed model
import bcrypt from "bcryptjs";

export const registerVehicle = async (req, res) => {  // <-- Renamed function
  try {
    const {
      nic, licenseNumber, licenseExpiry, address,
      preferredDistrict, vehicleType, vehicleNumber, email
    } = req.body;

    // 1. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Vehicle already exists" });

    // 2. Create truck driver profile
    const newVehicle = await VehicleRegModel.create({
      nic, licenseNumber, licenseExpiry, address,
      preferredDistrict, vehicleType, vehicleNumber,
    });

    res.status(201).json({ msg: "Vehicle registered", vehicle: newVehicle });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get all vehicles
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleRegModel.find().sort({ createdAt: -1 });
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Delete a vehicle
export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await VehicleRegModel.findByIdAndDelete(id);
    
    if (!vehicle) {
      return res.status(404).json({ msg: "Vehicle not found" });
    }
    
    res.status(200).json({ msg: "Vehicle deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const updateVehicleDetails = async (req, res) => {
  try {
    const { id } = req.params; // Extract vehicle ID from request parameters
    const updateData = req.body; // Extract updated data from request body

    // Find the vehicle by ID and update its details
    const updatedVehicle = await VehicleRegModel.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure validation rules are applied
    });

    if (!updatedVehicle) {
      return res.status(404).json({ msg: "Vehicle not found" });
    }

    res.status(200).json({ msg: "Vehicle details updated successfully", vehicle: updatedVehicle });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
