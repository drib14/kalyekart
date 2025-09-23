import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import {
	getAnalyticsData,
	getDailySalesData,
	streamAnalyticsData,
} from "../controllers/analytics.controller.js";
import Order from "../models/order.model.js";

const router = express.Router();

router.get("/stream", protectRoute, adminRoute, streamAnalyticsData);

router.get("/", protectRoute, adminRoute, async (req, res) => {
	try {
		const { filter } = req.query;
		const analyticsData = await getAnalyticsData();

		let startDate,
			endDate = new Date();

		switch (filter) {
			case "overall":
				const firstOrder = await Order.findOne().sort({ createdAt: 1 });
				startDate = firstOrder ? firstOrder.createdAt : new Date();
				break;
			case "daily":
				startDate = new Date();
				startDate.setHours(0, 0, 0, 0);
				break;
			case "weekly":
				startDate = new Date();
				startDate.setDate(startDate.getDate() - 7);
				break;
			case "yearly":
				startDate = new Date(new Date().getFullYear(), 0, 1);
				break;
			default:
				// Default to weekly
				startDate = new Date();
				startDate.setDate(startDate.getDate() - 7);
		}

		const dailySalesData = await getDailySalesData(startDate, endDate);

		res.json({
			analyticsData,
			dailySalesData,
		});
	} catch (error) {
		console.log("Error in analytics route", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
});

export default router;
