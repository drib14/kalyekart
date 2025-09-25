import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import orderRoutes from "./routes/order.route.js";
import userRoutes from "./routes/user.route.js";
import feedbackRoutes from "./routes/feedback.route.js";
import deliveryRoutes from "./routes/delivery.route.js";
import Order from "./models/order.model.js";
import { calculateETA } from "./lib/eta.js";

import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	})
);

app.use(express.json({ limit: "10mb" })); // allows you to parse the body of the request
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/users", userRoutes);
app.use("/api/delivery", deliveryRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
	console.log("Server is running on http://localhost:" + PORT);
	connectDB();
});
