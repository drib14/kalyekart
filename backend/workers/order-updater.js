import dotenv from "dotenv";
import { connectDB } from "../lib/db.js";
import Order from "../models/order.model.js";
import { calculateETA } from "../lib/eta.js";

dotenv.config();

const run = async () => {
	await connectDB();
	console.log("Order updater worker started.");

	setInterval(async () => {
		try {
			const now = new Date();
			// Check for orders whose ETA has passed more than 10 seconds ago
			const tenSecondsAgo = new Date(now.getTime() - 10000);

			const expiredOrders = await Order.find({
				statusETA: { $lte: tenSecondsAgo },
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
};

run();
