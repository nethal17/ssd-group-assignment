import { Driver } from '../models/driver.model.js';

// Create driver
export const createDriver = async (req, res) => {
  try {
    const { name, age } = req.body;
    const driver = await Driver.create({ name, age });
    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all drivers
export const getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.status(200).json(drivers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update driver's total salary
export const updateDriverSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalSalary } = req.body;
    const driver = await Driver.findByIdAndUpdate(id, { totalSalary }, { new: true });
    res.status(200).json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all payments
export const getAllPayments = async (req, res) => {
  try {
    const drivers = await Driver.find({}, 'name totalSalary'); // Fetch only name and totalSalary
    const payments = drivers.map(driver => ({
      driverName: driver.name,
      payAmount: driver.totalSalary || 0, // Default to 0 if totalSalary is not set
    }));
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get driver by ID
export const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    res.status(200).json(driver);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// new controller functio
export const updateDriverDeliveryCount = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryCount } = req.body;
    
    const driver = await Driver.findByIdAndUpdate(
      id, 
      { deliveryCount }, 
      { new: true }
    );
    
    res.status(200).json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};