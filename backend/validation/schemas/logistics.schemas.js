import { z } from "zod";
import { date, futureDate, idParams, objectId, optionalText, positiveInt, text } from "../common.js";

// ---- Deliveries
export const addDeliveryBody = z.strictObject({
    userId: objectId,
    productId: objectId,
    farmerId: objectId,
    productName: text("Product name", 200),
    quantity: positiveInt("Quantity", 100_000),
});

export const deliveryIdParams = idParams("deliveryId");
export const deliveryStatusBody = z.strictObject({
    deliveryStatus: z.enum(["pending", "completed", "cancelled"], { error: "Invalid delivery status" }),
});

// ---- Pickup (delivery) requests
const contactNumber = (label) =>
    z.string({ error: `${label} is required` }).trim().regex(/^\+?[0-9][0-9\s-]{6,19}$/, `${label} must be a valid phone number`);

export const deliveryRequestBody = z.strictObject({
    farmerId: positiveInt("Farmer ID", 1_000_000_000),
    farmerPhone: contactNumber("Farmer phone"),
    wasteType: text("Waste type", 100),
    pickupDate: date("Pickup date"),
    district: text("District", 100),
    otherDistrict: optionalText("Other district", 100),
    // Optional on the form: an empty value falls back to the model default
    emergencyContact: z.union([z.literal("").transform(() => undefined), contactNumber("Emergency contact")]).optional(),
    location: z.strictObject({
        type: z.literal("Point", { error: "Location type must be Point" }),
        coordinates: z.tuple([
            z.number({ error: "Coordinates must be numbers" }).finite(),
            z.number({ error: "Coordinates must be numbers" }).finite(),
        ], { error: "Location needs two coordinates" }),
    }, { error: "Pickup location is required" }),
});

// Only the fields the farmer-details form edits
export const updateFarmerDetailsBody = z.strictObject({
    farmerId: positiveInt("Farmer ID", 1_000_000_000).optional(),
    farmerPhone: contactNumber("Farmer phone").optional(),
    district: text("District", 100).optional(),
}).refine((b) => Object.keys(b).length > 0, { message: "Nothing to update" });

// ---- Vehicle registration (NIC: 12 digits, or 9 digits + V/X)
const vehicleFields = {
    nic: z.string({ error: "NIC is required" }).trim().regex(/^(\d{12}|\d{9}[VvXx])$/, "NIC must be 12 digits, or 9 digits followed by V or X"),
    licenseNumber: text("License number", 30).refine((v) => v.length >= 5, "License number must be at least 5 characters long"),
    licenseExpiry: futureDate("License expiry date"),
    address: text("Address", 300),
    preferredDistrict: text("Preferred district", 100),
    vehicleType: text("Vehicle type", 50),
    vehicleNumber: text("Vehicle number", 20).refine((v) => v.length >= 4, "Vehicle number must be at least 4 characters long"),
};

export const registerVehicleBody = z.strictObject(vehicleFields);

export const updateVehicleBody = z.strictObject(vehicleFields)
    .partial()
    .refine((b) => Object.keys(b).length > 0, { message: "Nothing to update" });
