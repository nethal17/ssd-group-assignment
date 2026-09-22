import express from 'express';
import {
  createDeliveryRequest,
  getAllDeliveryRequests,
  getDeliveryRequestById,
  updateDeliveryRequestStatusById,
  updateFarmerDetailsById,
  deleteFarmerDetailsById
} from "../controllers/deliveryReqController.js";

const router = express.Router();

// Create a new delivery request
router.post("/delivery-request", createDeliveryRequest);

// Get all delivery requests
router.get("/get-delivery-requests", getAllDeliveryRequests);

// Get a specific delivery request by ID
router.get("/delivery-request/:id", getDeliveryRequestById);

// update the status part using ID
router.put("/update-delivery-requests/:id",updateDeliveryRequestStatusById);

// update the farmer details
router.put("/update-farmer/:id", updateFarmerDetailsById);

// delete the farmer details
router.delete("/delete-farmer/:id", deleteFarmerDetailsById);

export default router;
