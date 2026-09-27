import express from "express";
import { addCheckoutDetails, getBillDetails } from "../controllers/checkout.controller.js";
import { validate } from "../validation/validate.js";
import { checkoutBody } from "../validation/schemas/commerce.schemas.js";

const router = express.Router();

router.post("/add", validate({ body: checkoutBody }), addCheckoutDetails); // Save buyer details
router.get("/bill/:userId", getBillDetails); // Fetch bill details

export default router;