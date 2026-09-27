import express from "express";
import { getAllWaste, createWaste, getWasteByType } from "../controllers/agriWasteController.js";
import { validate } from "../validation/validate.js";
import { createWasteBody } from "../validation/schemas/listing.schemas.js";

const router = express.Router();

router.get("/all", getAllWaste);
router.post("/create", validate({ body: createWasteBody }), createWaste);
router.get("/waste/:waste_type", getWasteByType);

export default router;