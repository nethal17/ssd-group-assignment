import express from "express";
import { registerVehicle, getAllVehicles, deleteVehicle, updateVehicleDetails } from "../controllers/VehicleReg.controller.js";
import { validate } from "../validation/validate.js";
import { registerVehicleBody, updateVehicleBody } from "../validation/schemas/logistics.schemas.js";
import { idParam } from "../validation/schemas/commerce.schemas.js";

const router = express.Router();

router.post("/register", validate({ body: registerVehicleBody }), registerVehicle);
router.get("/", getAllVehicles);
router.delete("/:id", validate({ params: idParam }), deleteVehicle);
router.put("/:id", validate({ params: idParam, body: updateVehicleBody }), updateVehicleDetails);

export default router;