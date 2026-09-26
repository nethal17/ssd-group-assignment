import DeliveryOrder from "../models/deliveryOrder.model.js";

// Get all delivery orders
export const getAllDeliveryOrders = async (req, res) => {
  try {
    const orders = await DeliveryOrder.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: "An internal server error occurred" });
  }
};

// Accept an order (status changes to 'toReceive')
export const acceptOrder = async (req, res) => {
  try {
    const order = await DeliveryOrder.findByIdAndUpdate(
      req.params.id,
      { status: "toReceive" },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: "An internal server error occurred" });
  }
};

// Decline an order (status stays 'toDeliver')
export const declineOrder = async (req, res) => {
  try {
    const order = await DeliveryOrder.findByIdAndUpdate(
      req.params.id,
      { status: "toDeliver" },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: "An internal server error occurred" });
  }
};

// Mark order as done
export const markAsDone = async (req, res) => {
  try {
    const order = await DeliveryOrder.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ msg: "An internal server error occurred" });
  }
}; 