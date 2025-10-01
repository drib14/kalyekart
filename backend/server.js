import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url"; // Import for resolving __dirname

// Correctly configure dotenv path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import orderRoutes from "./routes/order.route.js";
import userRoutes from "./routes/user.route.js";
import feedbackRoutes from "./routes/feedback.route.js";
import locationRoutes from "./routes/location.route.js";
import notificationRoutes from "./routes/notification.route.js";
import reviewRoutes from "./routes/review.route.js";
import favoriteRoutes from "./routes/favorite.route.js";
import Order from "./models/order.model.js";
import { calculateETA } from "./lib/eta.js";
import { connectDB } from "./lib/db.js";

// Import the worker to start it
import "./workers/email-worker.js";
import "./lib/firebase.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Since we've defined our own __dirname, we need to be careful with other path resolutions
const projectRoot = path.resolve(__dirname, ".."); // Assumes backend is one level down from root

app.use(
	cors({
		origin: process.env.CLIENT_URL,
		credentials: true,
	})
);

app.use(express.json({ limit: "10mb" }));
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
app.use("/api/locations", locationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(projectRoot, "frontend/dist")));

	// Catch-all route to serve the frontend
	app.get(/.*/, (req, res) => {
		res.sendFile(path.resolve(projectRoot, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
	console.log("Server is running on http://localhost:" + PORT);
	connectDB();
});