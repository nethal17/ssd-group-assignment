import express from "express";
import { 
    addDelivery, 
    getCompletedDeliveries, 
    getAllDeliveries, 
    getDeliveryById, 
    updateDeliveryStatus,
    getDeliveriesByUserId
} from "../controllers/DeliveryController.js";
import { validate } from "../validation/validate.js";
import { addDeliveryBody, deliveryIdParams, deliveryStatusBody } from "../validation/schemas/logistics.schemas.js";

const router = express.Router();

// Add a new delivery
router.post("/add", validate({ body: addDeliveryBody }), addDelivery);

// Get all deliveries
router.get("/", getAllDeliveries);

// Get completed deliveries
router.get("/completed", getCompletedDeliveries);

// Get delivery by ID
router.get("/:deliveryId", getDeliveryById);

// Update delivery status
router.patch("/:deliveryId/status", validate({ params: deliveryIdParams, body: deliveryStatusBody }), updateDeliveryStatus);

router.get("/getDeliveries/:userId", getDeliveriesByUserId);

export default router; 