import express from "express";
import { createRefund, getRefunds, updateRefundStatus, deleteRefund } from "../controllers/refund.controller.js";
import { validate } from "../validation/validate.js";
import { createRefundBody, refundIdParams, refundStatusBody } from "../validation/schemas/commerce.schemas.js";

const router = express.Router();

// Create a new refund
router.post("/add", validate({ body: createRefundBody }), createRefund);

// Get all refunds
router.get("/", getRefunds);

// Update refund status
router.patch("/:refundId/status", validate({ params: refundIdParams, body: refundStatusBody }), updateRefundStatus);

// Delete a refund
router.delete("/:refundId", validate({ params: refundIdParams }), deleteRefund);

export default router; 