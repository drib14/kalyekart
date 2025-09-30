import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { endOfDay, startOfDay, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns";

const getDatesAndGroupByFormat = (filter) => {
	let startDate, endDate, groupByFormat, unit;

	const now = new Date();

	switch (filter) {
		case "daily":
			startDate = startOfDay(now);
			endDate = endOfDay(now);
			groupByFormat = "%Y-%m-%d"; // Group by day for daily view
			unit = "day";
			break;
		case "weekly":
			startDate = startOfWeek(now, { weekStartsOn: 1 }); // Assuming week starts on Monday
			endDate = endOfWeek(now, { weekStartsOn: 1 });
			groupByFormat = "%Y-%m-%d"; // Group by day for weekly view
			unit = "day";
			break;
		case "yearly":
			startDate = startOfYear(now);
			endDate = endOfYear(now);
			groupByFormat = "%Y-%m"; // Group by month for yearly view
			unit = "month";
			break;
		case "overall":
		default:
			startDate = new Date(0); // A very long time ago
			endDate = now;
			groupByFormat = "%Y"; // Group by year for overall view
			unit = "year";
			break;
	}

	return { startDate, endDate, groupByFormat, unit };
};

export const getRevenueAnalytics = async (req, res) => {
	try {
		const { filter = "weekly" } = req.query; // Default to weekly
		const { startDate, endDate, groupByFormat, unit } = getDatesAndGroupByFormat(filter);

		// 1. Calculate total revenue for the period
		const revenueAggregation = await Order.aggregate([
			{
				$match: {
					status: "Delivered",
					createdAt: { $gte: startDate, $lte: endDate },
				},
			},
			{
				$group: {
					_id: null,
					totalRevenue: { $sum: "$totalAmount" },
				},
			},
		]);

		const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].totalRevenue : 0;

		// 2. Get data for the graph
		const graphDataAggregation = await Order.aggregate([
			{
				$match: {
					status: "Delivered",
					createdAt: { $gte: startDate, $lte: endDate },
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: groupByFormat, date: "$createdAt" } },
					revenue: { $sum: "$totalAmount" },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		// 3. Get other general stats (can be cached in a real app for performance)
		const totalUsers = await User.countDocuments({ role: "customer" });
		const totalProducts = await Product.countDocuments();
		const totalOrders = await Order.countDocuments({ status: "Delivered" });

		res.status(200).json({
			totalRevenue,
			graphData: graphDataAggregation.map((item) => ({ name: item._id, revenue: item.revenue })),
			stats: {
				totalUsers,
				totalProducts,
				totalOrders,
			},
		});
	} catch (error) {
		console.error("Error in getRevenueAnalytics:", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};