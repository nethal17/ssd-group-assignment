import { z } from "zod";
import {
    date, idParams, money, nonNegativeInt, objectId, optionalText, positiveInt, text,
} from "../common.js";

// ---- Cart (V17: price, deliveryCost etc. come from the listing, so they are rejected here)
export const cartItemBody = z.strictObject({
    userId: objectId,
    wasteId: objectId,
    quantity: positiveInt("Quantity", 100_000),
});

export const cartRemoveBody = z.strictObject({
    userId: objectId,
    wasteId: objectId,
});

export const cartUserParams = idParams("userId");

// ---- Checkout (total is computed from the server-side cart)
export const checkoutBody = z.strictObject({
    userId: objectId,
    district: text("District", 100),
    city: text("City", 100),
    streetNo: text("Street", 200),
});

// ---- Buyer delivery address
export const buyerAddressParams = idParams("id");
export const buyerAddressBody = z.strictObject({
    buyerId: objectId,
    address: text("Address", 300),
    city: text("City", 100),
    postalCode: z.string({ error: "Postal code is required" }).trim().regex(/^\d{5}$/, "Postal code must be 5 digits"),
    // The form accepts "077-123 4567"; normalise separators before checking for 10 digits
    phone: z.string({ error: "Phone number is required" })
        .transform((v) => v.replace(/[\s-]/g, ""))
        .pipe(z.string().regex(/^\d{10}$/, "Phone number must be 10 digits")),
    saveInfo: z.boolean({ error: "saveInfo must be true or false" }),
}).refine((b) => b.saveInfo === true, { message: "You must agree to save the information", path: ["saveInfo"] });

// ---- Order history
export const orderHistoryBody = z.strictObject({
    userId: objectId,
    productId: objectId,
    farmerId: objectId,
    productName: text("Product name", 200),
    quantity: positiveInt("Quantity", 100_000),
    totalPrice: money("Total price", { allowZero: true }),
});

// Items are the buyer's cart lines; extra display fields (image, delivery cost, _id)
// are stripped rather than rejected because the client echoes the cart back.
const paidCartItem = z.object({
    wasteId: objectId,
    farmerId: objectId,
    description: text("Item description", 500),
    price: money("Item price", { allowZero: true }),
    quantity: positiveInt("Item quantity", 100_000).optional(),
});

export const processPaymentBody = z.strictObject({
    userId: objectId,
    cartItems: z.array(paidCartItem, { error: "cartItems must be a list" })
        .min(1, "Cart is empty")
        .max(100, "Too many items in one order"),
});

export const orderIdParams = idParams("orderId");
export const idParam = idParams("id");

// ---- Orders
export const addOrderBody = z.strictObject({
    buyerId: objectId,
    productId: objectId,
    quantity: positiveInt("Quantity", 100_000),
    totalPrice: money("Total price", { allowZero: true }),
});

// ---- Refunds (status is server-controlled: new refunds always start as pending)
export const createRefundBody = z.strictObject({
    userId: objectId,
    productName: text("Product name", 200),
    quantity: positiveInt("Quantity", 100_000),
    totalPrice: money("Total price", { allowZero: true }),
    orderDate: date("Order date"),
    refundReason: text("Refund reason", 500),
});

export const refundIdParams = idParams("refundId");
export const refundStatusBody = z.strictObject({
    status: z.enum(["pending", "approved", "rejected"], { error: "Status must be pending, approved or rejected" }),
});

// ---- Reviews
export const addReviewBody = z.strictObject({
    buyerId: objectId,
    orderId: objectId,
    farmerId: objectId,
    productName: text("Product name", 200),
    rating: z.preprocess(
        (v) => (typeof v === "string" && v.trim() !== "" ? Number(v) : v),
        z.number({ error: "Rating must be a number" }).int("Rating must be a whole number").min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
    ),
    review: text("Review", 2000),
});

export const reviewIdParams = idParams("reviewId");
export const deleteReviewBody = z.strictObject({
    reason: optionalText("Reason", 500),
});

// ---- Driver salary bookkeeping (payments themselves are V18)
export const createDriverBody = z.strictObject({
    name: text("Name", 100),
    age: positiveInt("Age", 100).refine((a) => a >= 18, "Driver must be at least 18"),
});

export const driverSalaryBody = z.strictObject({
    totalSalary: money("Total salary", { allowZero: true }),
});

export const driverDeliveryCountBody = z.strictObject({
    deliveryCount: nonNegativeInt("Delivery count", 100_000),
});
