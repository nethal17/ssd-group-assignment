import mongoose from "mongoose";
import ProductListing from "../models/ProductListing.js";

// ProductListing has no deliveryCost field, so delivery is a server-side
// constant. The frontend used to hardcode 1000 and send it in the body; same
// number here so totals are unchanged for honest clients.
export const DELIVERY_COST_PER_ITEM = 1000;

// Quantity must be a positive whole number. Rejects 0, negatives, decimals,
// NaN/Infinity and non-numeric junk. Returns null when invalid.
export const parseQuantity = (value) => {
  // Number() happily turns true and [2] into numbers, so only take an actual
  // number or a numeric string.
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;

  const qty = Number(value);
  if (!Number.isInteger(qty) || qty < 1) return null;
  return qty;
};

// The listing is the only source of truth for price. Anything not approved
// isn't sellable.
export const findSellableListing = async (wasteId) => {
  if (!mongoose.Types.ObjectId.isValid(wasteId)) return null;
  const listing = await ProductListing.findById(wasteId);
  if (!listing || listing.status !== "Approved") return null;
  return listing;
};

// Re-reads every listing so a cart that has been sitting around (or was
// tampered with before this fix) can't keep a stale price. Items whose listing
// is gone or no longer approved are dropped - they can't be priced honestly.
export const repriceCart = async (cart) => {
  const priced = [];

  for (const item of cart.items) {
    const listing = await findSellableListing(item.wasteId);
    if (!listing) continue;

    item.price = listing.price;
    item.deliveryCost = DELIVERY_COST_PER_ITEM;
    item.farmerId = listing.farmerId;
    priced.push(item);
  }

  cart.items = priced;
  cart.totalPrice = priced.reduce(
    (total, item) => total + item.price * item.quantity + item.deliveryCost,
    0
  );

  return cart;
};
