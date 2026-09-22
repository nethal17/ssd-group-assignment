import express from "express";
import { registerVehicle, getAllVehicles, deleteVehicle, updateVehicleDetails } from "../controllers/VehicleReg.controller.js";

const router = express.Router();

router.post("/register", registerVehicle);
router.get("/", getAllVehicles);
router.delete("/:id", deleteVehicle);
router.put("/:id", updateVehicleDetails);

export default router;