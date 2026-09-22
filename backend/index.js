import dotenv from "dotenv";
import express, { json } from "express";
import { connect } from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/authRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import photoRouter from "./routes/profileRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import driverRoutes from './routes/driver.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import agriWasteRoutes from "./routes/agriWasteRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import stripeRoutes from './routes/stripe.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import stripePaymentsRoutes from './routes/stripePayments.routes.js';
import driverPaymentsRoutes from './routes/driverPayments.routes.js';
import driverPaymentRoutes from './routes/driverPayment.routes.js';
import deliveryRoutes from './routes/deliverRoutes.js';

import orderHistoryRoutes from "./routes/orderHistory.routes.js";
import deliveryReqRoutes from "./routes/deliveryReqRoutes.js";
import ProductListingRoutes from './routes/ProductListingRoutes.js';

import checkoutRoutes from "./routes/checkout.routes.js";
import buyerAddressRoutes from "./routes/buyerAddressRoutes.js";

import MarketplaceRoutes from './routes/MarketplaceRoutes.js';


import refundRoutes from './routes/refund.routes.js';
import reportRoutes from "./routes/reportRoutes.js";
import vehicleRegRoutes from "./routes/VehicleReg.routes.js";
import deliveryHistoryRoutes from './routes/deliveryHistory.routes.js';



dotenv.config();

const app = express();
app.use('/api/webhook', express.raw({ type: 'application/json' }));
// Middleware
app.use(json());
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Agri-Waste Backend API is Running...");
});

//Nethal
app.use("/api/auth", router);
app.use("/api/photo", photoRouter);

//vibhu
app.use('/api', driverRoutes);
app.use('/api', paymentRoutes);
app.use('/api', stripeRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api', stripePaymentsRoutes);
app.use('/api/driver-payments', driverPaymentsRoutes);
app.use('/api', driverPaymentRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/delivery', deliveryRoutes);

// Reports & Analytics
app.use('/api/reports', reportRoutes);


//Ricky
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/product-listing', ProductListingRoutes);
app.use('/api/marketplace', MarketplaceRoutes);

//Naduli
app.use("/api/agri-waste", agriWasteRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/address", buyerAddressRoutes);
app.use("/api/order-history", orderHistoryRoutes);

// yuwani
app.use('/api/deliveryReq', deliveryReqRoutes);
app.use("/api/vehicle-reg", vehicleRegRoutes);
app.use('/api/delivery-orders', deliveryHistoryRoutes);

// MongoDB Connection - Connect before starting server
connect(process.env.MONGO_URI, {
}).then(() => {
  console.log("MongoDB Connected");
  
  // Start the server only after DB connection
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error("MongoDB Connection Error:", err);
  process.exit(1);
});