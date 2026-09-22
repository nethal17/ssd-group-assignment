import express from "express";
import { saveOrUpdateBuyerAddress, getBuyerAddresses, getAddressByBuyerId } from "../controllers/buyerAddressController.js";

const router = express.Router();

// Correct endpoints
router.put("/add/:id", saveOrUpdateBuyerAddress);
router.get("/read", getBuyerAddresses);
router.get("/get-address/:buyerId", getAddressByBuyerId);


export default router;
