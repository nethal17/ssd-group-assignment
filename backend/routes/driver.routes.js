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
import { validate } from "../validation/validate.js";
import { createDriverBody, driverSalaryBody, driverDeliveryCountBody, idParam } from "../validation/schemas/commerce.schemas.js";

const router = express.Router();

// Define routes
router.post('/drivers', validate({ body: createDriverBody }), createDriver);
router.get('/drivers', getAllDrivers);
router.get('/drivers/payments', getAllPayments); // Moved before :id route to prevent conflict
router.get('/drivers/:id', getDriverById);
router.put('/drivers/:id/salary', validate({ params: idParam, body: driverSalaryBody }), updateDriverSalary);
router.put('/drivers/:id/delivery-count', validate({ params: idParam, body: driverDeliveryCountBody }), updateDriverDeliveryCount); 
router.post('/create-checkout-session', createCheckoutSession);

export default router;