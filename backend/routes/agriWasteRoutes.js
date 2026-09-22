import express from "express";
import { getAllWaste, createWaste, getWasteByType } from "../controllers/agriWasteController.js";

const router = express.Router();

router.get("/all", getAllWaste);
router.post("/create", createWaste);
router.get("/waste/:waste_type", getWasteByType);

export default router;