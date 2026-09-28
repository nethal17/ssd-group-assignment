import { VehicleReg as VehicleRegModel } from "../models/VehicleReg.model.js";  // <-- Renamed model
import bcrypt from "bcryptjs";

export const registerVehicle = async (req, res) => {  // <-- Renamed function
  try {
    const {
      nic, licenseNumber, licenseExpiry, address,
      preferredDistrict, vehicleType, vehicleNumber
    } = req.body;

    // 1. Reject a duplicate registration of the same vehicle. (This used to look up
    //    a User by an email the form never sends; findOne({ email: undefined })
    //    matched any user, so every registration was refused.)
    const existingVehicle = await VehicleRegModel.findOne({ vehicleNumber });
    if (existingVehicle) return res.status(400).json({ msg: "Vehicle already exists" });

    // 2. Create truck driver profile
    const newVehicle = await VehicleRegModel.create({
      nic, licenseNumber, licenseExpiry, address,
      preferredDistrict, vehicleType, vehicleNumber,
    });

    res.status(201).json({ msg: "Vehicle registered", vehicle: newVehicle });
  } catch (err) {
    res.status(500).json({ msg: "An internal server error occurred" });
  }
};

// Get all vehicles
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await VehicleRegModel.find().sort({ createdAt: -1 });
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ msg: "An internal server error occurred" });
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
    res.status(500).json({ msg: "An internal server error occurred" });
  }
};

export const updateVehicleDetails = async (req, res) => {
  try {
    const { id } = req.params; // Extract vehicle ID from request parameters
    // Only the editable, validated vehicle fields (see updateVehicleBody)
    const { nic, licenseNumber, licenseExpiry, address, preferredDistrict, vehicleType, vehicleNumber } = req.body;
    const updateData = Object.fromEntries(
      Object.entries({ nic, licenseNumber, licenseExpiry, address, preferredDistrict, vehicleType, vehicleNumber })
        .filter(([, value]) => value !== undefined)
    );
    updateData.updatedAt = new Date();

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
    res.status(500).json({ msg: "An internal server error occurred" });
  }
};
