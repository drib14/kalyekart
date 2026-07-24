// Import environment configuration first to ensure variables are loaded
import "./lib/env.js";

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import discountRoutes from "./routes/discount.route.js";
import userDiscountRoutes from "./routes/userDiscount.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import orderRoutes from "./routes/order.route.js";
import userRoutes from "./routes/user.route.js";
import feedbackRoutes from "./routes/feedback.route.js";
import locationRoutes from "./routes/location.route.js";
import notificationRoutes from "./routes/notification.route.js";
import reviewRoutes from "./routes/review.route.js";
import favoriteRoutes from "./routes/favorite.route.js";
import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

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
app.use("/api/discounts", userDiscountRoutes);
app.use("/api/admin/discounts", discountRoutes);
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

	app.get(/.*/, (req, res) => {
		res.sendFile(path.resolve(projectRoot, "frontend", "dist", "index.html"));
	});
}

if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
	app.listen(PORT, () => {
		console.log("Server is running on http://localhost:" + PORT);
		connectDB();
	});
}

export default app;
