import express from "express";
import { 
  getAllDeliveryOrders, 
  acceptOrder, 
  declineOrder, 
  markAsDone 
} from "../controllers/deliveryHistory.controller.js";

const router = express.Router();

// Get all delivery orders
router.get("/", getAllDeliveryOrders);

// Accept an order
router.put("/:id/accept", acceptOrder);

// Decline an order
router.put("/:id/decline", declineOrder);

// Mark order as done
router.put("/:id/mark-done", markAsDone);

export default router; 