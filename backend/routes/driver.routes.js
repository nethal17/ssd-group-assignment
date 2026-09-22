import express from 'express';
import { 
  createDriver, 
  getAllDrivers, 
  getDriverById, 
  updateDriverSalary, 
  getAllPayments,
  updateDriverDeliveryCount 
} from "../controllers/driver.controller.js";
import { createCheckoutSession } from '../controllers/stripe.controller.js'; 

const router = express.Router();

// Define routes
router.post('/drivers', createDriver);
router.get('/drivers', getAllDrivers);
router.get('/drivers/payments', getAllPayments); // Moved before :id route to prevent conflict
router.get('/drivers/:id', getDriverById);
router.put('/drivers/:id/salary', updateDriverSalary);
router.put('/drivers/:id/delivery-count', updateDriverDeliveryCount); 
router.post('/create-checkout-session', createCheckoutSession);

export default router;