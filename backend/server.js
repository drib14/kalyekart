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
app.use("/api/users", userRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
	console.log("Server is running on http://localhost:" + PORT);
	connectDB();

	setInterval(async () => {
		try {
			const now = new Date();
			const expiredOrders = await Order.find({
				statusETA: { $lte: now },
				status: { $nin: ["Delivered", "Cancelled"] },
			});

			for (const order of expiredOrders) {
				let nextStatus;

				switch (order.status) {
					case "Pending":
						nextStatus = "Preparing";
						break;
					case "Preparing":
						nextStatus = "Out for Delivery";
						break;
					case "Out for Delivery":
						nextStatus = "Delivered";
						break;
					default:
						continue;
				}

				order.status = nextStatus;
				order.statusETA = calculateETA(nextStatus, order);
				await order.save();
				console.log(`Order ${order._id} auto-updated to ${nextStatus}`);
			}
		} catch (error) {
			console.error("Error in auto-update task:", error);
		}
	}, 10000); // Run every 10 seconds
});
