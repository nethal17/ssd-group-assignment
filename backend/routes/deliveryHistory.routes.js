import express from "express";
import { 
  getAllDeliveryOrders, 
  acceptOrder, 
  declineOrder, 
  markAsDone 
} from "../controllers/deliveryHistory.controller.js";
import { validate } from "../validation/validate.js";
import { idParam } from "../validation/schemas/commerce.schemas.js";

const router = express.Router();

// Get all delivery orders
router.get("/", getAllDeliveryOrders);

// Accept an order
router.put("/:id/accept", validate({ params: idParam }), acceptOrder);

// Decline an order
router.put("/:id/decline", validate({ params: idParam }), declineOrder);

// Mark order as done
router.put("/:id/mark-done", validate({ params: idParam }), markAsDone);

export default router; 