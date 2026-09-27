import { z } from "zod";
import { date, futureDate, httpsUrl, idParams, money, optionalText, positiveInt, text } from "../common.js";

// ---- Farmer product listings (farmerId and status are set by the server)
export const createListingBody = z.strictObject({
    wasteCategory: z.enum(["Organic Waste", "Inorganic Waste"], { error: "Invalid waste category" }),
    wasteType: text("Waste type", 100),
    wasteItem: text("Waste item", 100),
    province: text("Province", 100),
    district: text("District", 100),
    city: text("City", 100),
    quantity: positiveInt("Quantity", 1_000_000),
    price: money("Price"),
    description: text("Description", 2000),
    expireDate: futureDate("Expiry date"),
    photo: z.union([z.literal(""), z.null(), httpsUrl("Photo")]).optional(),
    bankName: text("Bank name", 100),
    accountNumber: z.string({ error: "Account number is required" }).trim().regex(/^[0-9-]{4,30}$/, "Account number may only contain digits"),
    accountHolderName: text("Account holder name", 100),
    branch: text("Branch", 100),
});

export const listingIdParams = idParams("listingId");

// The notification goes to the farmer's stored email; the client does not choose the recipient
export const declineListingBody = z.strictObject({
    reason: optionalText("Reason", 500),
});

// ---- Inventory (status changes go through the approve endpoint only)
const inventoryFields = {
    productName: text("Product name", 200),
    description: text("Description", 2000),
    quantity: positiveInt("Quantity", 1_000_000),
    price: money("Price"),
    photo: httpsUrl("Photo").optional(),
    expireDate: futureDate("Expiry date"),
};

export const addInventoryBody = z.strictObject(inventoryFields);

export const editInventoryBody = z.strictObject(inventoryFields)
    .partial()
    .refine((b) => Object.keys(b).length > 0, { message: "Nothing to update" });

export const inventoryIdParams = idParams("id");

// ---- Agri-waste listings
export const createWasteBody = z.strictObject({
    waste_type: text("Waste type", 100),
    district: text("District", 100),
    quantity: money("Quantity"),
    price: money("Price", { allowZero: true }),
    description: text("Description", 2000),
    expire_date: date("Expiry date"),
});
