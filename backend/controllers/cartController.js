import Cart from "../models/Cart.js";
import {
  DELIVERY_COST_PER_ITEM,
  findSellableListing,
  parseQuantity,
  repriceCart,
} from "../utils/cartPricing.js";

//  Insert Item to cart
export const addToCart = async (req, res) => {
  try {
    // Only userId, wasteId and quantity are read. price, deliveryCost,
    // farmerId, description and productImage are ignored if sent - they all
    // come from the listing, or a buyer could name their own price.
    const { userId, wasteId, quantity } = req.body;

    const qty = parseQuantity(quantity);
    if (qty === null) {
      return res.status(400).json({ error: "Quantity must be a positive whole number" });
    }

    const listing = await findSellableListing(wasteId);
    if (!listing) {
      return res.status(404).json({ error: "Item not found or not available" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 });
    }

    // Check if item exists
    const itemIndex = cart.items.findIndex(item => item.wasteId.toString() === listing._id.toString());
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += qty;
    } else {
      cart.items.push({
        wasteId: listing._id,
        farmerId: listing.farmerId,
        description: listing.wasteItem || listing.description,
        price: listing.price,
        quantity: qty,
        deliveryCost: DELIVERY_COST_PER_ITEM,
        productImage: listing.image || undefined,
      });
    }

    await repriceCart(cart);
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to add item to cart" });
  }
};

// Get cart items
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId }).populate("items._id");
    if (!cart) return res.status(404).json({ message: "Cart is empty" });
    res.status(200).json(cart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

//  Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    console.log("Received update request:", req.body); 
    const { userId, wasteId, quantity } = req.body;
    if (!userId || !wasteId || quantity === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const qty = parseQuantity(quantity);
    if (qty === null) {
      return res.status(400).json({ error: "Quantity must be a positive whole number" });
    }
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const itemIndex = cart.items.findIndex(
      (item) => item.wasteId.toString() === wasteId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    cart.items[itemIndex].quantity = qty;

    //Recalculate total price from the listings, not from stored numbers
    await repriceCart(cart);

    await cart.save();

    console.log("Cart updated successfully:", cart);
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: "Failed to update item quantity", details: "An internal server error occurred" });
  }
};

//  Remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const { userId, wasteId } = req.body;
    const cart = await Cart.findOne({ userId });
    
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter(item => item.wasteId.toString() !== wasteId);

    await repriceCart(cart);

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
};

// Clear cart for a user
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Clear all items from the cart
    cart.items = [];
    cart.totalPrice = 0;
    
    await cart.save();
    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Failed to clear cart" });
  }
};