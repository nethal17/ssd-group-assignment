import express from "express";
import { saveOrUpdateBuyerAddress, getBuyerAddresses, getAddressByBuyerId } from "../controllers/buyerAddressController.js";
import { validate } from "../validation/validate.js";
import { buyerAddressParams, buyerAddressBody } from "../validation/schemas/commerce.schemas.js";

const router = express.Router();

// Correct endpoints
router.put("/add/:id", validate({ params: buyerAddressParams, body: buyerAddressBody }), saveOrUpdateBuyerAddress);
router.get("/read", getBuyerAddresses);
router.get("/get-address/:buyerId", getAddressByBuyerId);


export default router;
