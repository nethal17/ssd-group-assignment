import OrderHistory from "../models/orderHistory.model.js"; 
import Cart from "../models/Cart.js";
import ProductListing from "../models/ProductListing.js";
import { repriceCart } from "../utils/cartPricing.js";

//Add Order History
export const addOrderHistory = async (req, res) => {
  try {
    // Only the validated fields are written; orderStatus/orderDate stay server-controlled
    const { userId, productId, farmerId, productName, quantity, totalPrice } = req.body;
    const newOrder = new OrderHistory({ userId, productId, farmerId, productName, quantity, totalPrice });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error adding order:", error);
    res.status(500).json({ message: "Failed to add order" });
  }
};

// Get all order history
export const getAllOrderHistory = async (req, res) => {
  try {
    const orders = await OrderHistory.find().sort({ orderDate: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all order history:", error);
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
};

// 🧹 Get Order History by User
export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await OrderHistory.find({ userId }).sort({ orderDate: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

//Cancel Order (Delete)
export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    await OrderHistory.findByIdAndDelete(orderId);
    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await OrderHistory.findByIdAndDelete(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Error deleting order" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID.' });
    }

    const order = await OrderHistory.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.status(200).json({ message: 'Order updated successfully.', order });
  } catch (error) {
    res.status(500).json({ message: "An internal server error occurred" });
  }
};

// Process order after successful payment
export const processOrderAfterPayment = async (req, res) => {
  try {
    const { userId } = req.body;

    // A buyer can only turn their own cart into orders
    if (req.user?.id !== userId) {
      return res.status(403).json({ message: "You can only process your own order" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Everything recorded comes from the server: listing price, listing farmer and the
    // cart quantity. Items whose listing is gone or no longer approved are dropped.
    await repriceCart(cart);
    if (cart.items.length === 0) {
      await cart.save();
      return res.status(409).json({ message: "None of the items in your cart are still available" });
    }

    for (const item of cart.items) {
      await OrderHistory.create({
        userId,
        productId: item.wasteId,
        farmerId: item.farmerId,
        productName: item.description,
        quantity: item.quantity,
        totalPrice: item.price * item.quantity
      });

      // The listing is sold, so it leaves the marketplace
      await ProductListing.findByIdAndDelete(item.wasteId);
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({ message: "Order processed successfully" });
  } catch (error) {
    console.error("Error processing order:", error);
    res.status(500).json({ message: "Failed to process order" });
  }
};


export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await OrderHistory.findByIdAndUpdate(
      orderId,
      { orderStatus: "toReceive" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order accepted successfully", order });
  } catch (error) {
    console.error("Error accepting order:", error);
    res.status(500).json({ message: "Failed to accept order" });
  }
};

export const markOrderAsDone = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await OrderHistory.findByIdAndUpdate(
      orderId,
      { orderStatus: "toReview" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order marked as done successfully", order });
  } catch (error) {
    console.error("Error marking order as done:", error);
    res.status(500).json({ message: "Failed to mark order as done" });
  }
};
