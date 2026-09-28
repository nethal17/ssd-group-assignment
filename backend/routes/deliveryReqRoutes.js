import express from 'express';
import {
  createDeliveryRequest,
  getAllDeliveryRequests,
  getDeliveryRequestById,
  updateDeliveryRequestStatusById,
  updateFarmerDetailsById,
  deleteFarmerDetailsById
} from "../controllers/deliveryReqController.js";
import { validate } from "../validation/validate.js";
import { deliveryRequestBody, updateFarmerDetailsBody } from "../validation/schemas/logistics.schemas.js";
import { idParam } from "../validation/schemas/commerce.schemas.js";

const router = express.Router();

// Create a new delivery request
router.post("/delivery-request", validate({ body: deliveryRequestBody }), createDeliveryRequest);

// Get all delivery requests
router.get("/get-delivery-requests", getAllDeliveryRequests);

// Get a specific delivery request by ID
router.get("/delivery-request/:id", getDeliveryRequestById);

// update the status part using ID
router.put("/update-delivery-requests/:id", validate({ params: idParam }), updateDeliveryRequestStatusById);

// update the farmer details
router.put("/update-farmer/:id", validate({ params: idParam, body: updateFarmerDetailsBody }), updateFarmerDetailsById);

// delete the farmer details
router.delete("/delete-farmer/:id", validate({ params: idParam }), deleteFarmerDetailsById);

export default router;
