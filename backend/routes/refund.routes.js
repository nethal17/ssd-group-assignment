import express from "express";
import { createRefund, getRefunds, updateRefundStatus, deleteRefund } from "../controllers/refund.controller.js";

const router = express.Router();

// Create a new refund
router.post("/add", createRefund);

// Get all refunds
router.get("/", getRefunds);

// Update refund status
router.patch("/:refundId/status", updateRefundStatus);

// Delete a refund
router.delete("/:refundId", deleteRefund);

export default router; 