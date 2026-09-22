import express from "express";
import { addOrderHistory, getOrderHistory, cancelOrder, deleteOrder, getAllOrderHistory, processOrderAfterPayment, acceptOrder, markOrderAsDone } from "../controllers/orderHistory.controller.js";

const router = express.Router();

router.post("/add", addOrderHistory); // After payment
router.get("/", getAllOrderHistory); // Get all order history
router.get("/user/:userId", getOrderHistory); // Get user order history
router.delete("/cancel/:orderId", cancelOrder); // Cancel order
router.delete("/:id", deleteOrder); // Delete order
router.post("/process-payment", processOrderAfterPayment); // Process order after successful payment
router.put("/:orderId/accept", acceptOrder); // Accept order
router.put("/:orderId/mark-done", markOrderAsDone); // Mark order as done

export default router;
