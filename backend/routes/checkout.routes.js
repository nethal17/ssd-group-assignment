import express from "express";
import { addCheckoutDetails, getBillDetails } from "../controllers/checkout.controller.js";

const router = express.Router();

router.post("/add", addCheckoutDetails); // Save buyer details
router.get("/bill/:userId", getBillDetails); // Fetch bill details

export default router;