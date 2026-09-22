import Checkout from "../models/checkout.model.js";
import Cart from "../models/Cart.js"; 

// Add Checkout Details
export const addCheckoutDetails = async (req, res) => {
  try {
    const { userId, district, city, streetNo } = req.body;

    // Get cart total price for this user
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // Create checkout entry
    const checkout = new Checkout({
      userId,
      district,
      city,
      streetNo,
      totalPrice: cart.totalPrice + 1000, // Default delivery cost
    });

    // Save checkout
    await checkout.save();
    res.status(201).json({ message: "Checkout details saved", checkout });

  } catch (error) {
    res.status(500).json({ error: "Failed to save checkout details" });
  }
};

// Get Bill Details
export const getBillDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId }).populate("items.wasteId");

    if (!cart) return res.status(404).json({ message: "Cart is empty" });

    res.status(200).json({
      items: cart.items,
      totalPrice: cart.totalPrice + 1000, // Default delivery cost
    });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bill details" });
  }
};