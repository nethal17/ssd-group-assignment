import express from "express";
import { addOrderHistory, getOrderHistory, cancelOrder, deleteOrder, getAllOrderHistory, processOrderAfterPayment, acceptOrder, markOrderAsDone } from "../controllers/orderHistory.controller.js";
import { validate } from "../validation/validate.js";
import { orderHistoryBody, processPaymentBody, orderIdParams, idParam } from "../validation/schemas/commerce.schemas.js";

const router = express.Router();

router.post("/add", validate({ body: orderHistoryBody }), addOrderHistory); // After payment
router.get("/", getAllOrderHistory); // Get all order history
router.get("/user/:userId", getOrderHistory); // Get user order history
router.delete("/cancel/:orderId", validate({ params: orderIdParams }), cancelOrder); // Cancel order
router.delete("/:id", validate({ params: idParam }), deleteOrder); // Delete order
router.post("/process-payment", validate({ body: processPaymentBody }), processOrderAfterPayment); // Process order after successful payment
router.put("/:orderId/accept", validate({ params: orderIdParams }), acceptOrder); // Accept order
router.put("/:orderId/mark-done", validate({ params: orderIdParams }), markOrderAsDone); // Mark order as done

export default router;
