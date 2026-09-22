import Cart from "../models/Cart.js";

//  Insert Item to cart
export const addToCart = async (req, res) => {
  try {
    const { userId, wasteId, farmerId, description, price, deliveryCost, quantity, productImage } = req.body;
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 });
    }

    // Check if item exists
    const itemIndex = cart.items.findIndex(item => item.wasteId.toString() === wasteId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ wasteId, farmerId, description, price, quantity, deliveryCost, productImage});
    }
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity + item.deliveryCost,
      0
    );
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
    cart.items[itemIndex].quantity = quantity;

    //Recalculate total price
    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity + item.deliveryCost,
      0
    );

    await cart.save();

    console.log("Cart updated successfully:", cart);
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: "Failed to update item quantity", details: error.message });
  }
};

//  Remove item from cart
export const removeCartItem = async (req, res) => {
  try {
    const { userId, wasteId } = req.body;
    const cart = await Cart.findOne({ userId });
    
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = cart.items.filter(item => item.wasteId.toString() !== wasteId);

    cart.totalPrice = cart.items.reduce(
      (total, item) => total + item.price * item.quantity + item.deliveryCost,
      0
    );

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