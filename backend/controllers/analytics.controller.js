import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { endOfDay, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

// Helper to determine date ranges and grouping formats based on the filter
const getAnalyticsTimeframe = (filter) => {
	const now = new Date();
	let startDate, endDate, groupByFormat;

	switch (filter) {
		case "daily":
			// Correctly calculates a rolling 24-hour window from the current time
			startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
			endDate = now;
			groupByFormat = "%Y-%m-%d %H:00"; // Group by hour for a daily view
			break;
		case "weekly":
			// Sets the start of the week to Sunday, aligning with common business reporting
			startDate = startOfWeek(now, { weekStartsOn: 0 }); // 0 for Sunday
			endDate = endOfWeek(now, { weekStartsOn: 0 });
			groupByFormat = "%Y-%m-%d"; // Group by day for a weekly view
			break;
		case "monthly":
			startDate = startOfMonth(now);
			endDate = endOfMonth(now);
			groupByFormat = "%Y-%m-%d"; // Group by day for a monthly view
			break;
		case "yearly":
			startDate = startOfYear(now);
			endDate = endOfYear(now);
			groupByFormat = "%Y-%m"; // Group by month for a yearly view
			break;
		case "overall":
		default:
			startDate = new Date(0); // Epoch start
			endDate = now;
			groupByFormat = "%Y"; // Group by year for an overall view
			break;
	}
	return { startDate, endDate, groupByFormat };
};

// Main function to fetch all analytics data
const getAnalyticsData = async (filter) => {
	const { startDate, endDate, groupByFormat } = getAnalyticsTimeframe(filter);

	// Aggregation for period-specific stats (sales and revenue)
	const periodStatsPromise = Order.aggregate([
		{
			$match: {
				status: "Delivered",
				createdAt: { $gte: startDate, $lte: endDate },
			},
		},
		{
			$group: {
				_id: null,
				totalSales: { $sum: 1 },
				totalRevenue: { $sum: "$totalAmount" },
			},
		},
	]);

	// Aggregation for the graph data
	const graphDataPromise = Order.aggregate([
		{
			$match: {
				status: "Delivered",
				createdAt: { $gte: startDate, $lte: endDate },
			},
		},
		{
			$group: {
				_id: { $dateToString: { format: groupByFormat, date: "$createdAt" } },
				sales: { $sum: 1 },
				revenue: { $sum: "$totalAmount" },
			},
		},
		{ $sort: { _id: 1 } },
	]);

	// General stats (can be cached for performance)
	const totalUsersPromise = User.countDocuments(); // Count all users including admins
	const totalProductsPromise = Product.countDocuments();

	// Execute all promises concurrently
	const [periodStatsResult, graphDataResult, totalUsers, totalProducts] = await Promise.all([
		periodStatsPromise,
		graphDataPromise,
		totalUsersPromise,
		totalProductsPromise,
	]);

	const { totalSales = 0, totalRevenue = 0 } = periodStatsResult[0] || {};

	return {
		totalRevenue,
		totalSales,
		graphData: graphDataResult.map((item) => ({
			name: item._id,
			sales: item.sales,
			revenue: item.revenue,
		})),
		stats: {
			totalUsers,
			totalProducts,
		},
	};
};

// SSE endpoint to stream analytics data
export const streamAnalyticsData = async (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();

	let lastSentData = null;
	const filter = req.query.filter || "weekly";

	const sendData = async () => {
		try {
			const data = await getAnalyticsData(filter);
			const dataToSend = JSON.stringify(data);

			if (dataToSend !== lastSentData) {
				res.write(`data: ${dataToSend}\n\n`);
				lastSentData = dataToSend;
			}
		} catch (error) {
			console.error("Error fetching analytics data for SSE:", error);
			// Don't close the connection on error, just log it
		}
	};

	// Send data immediately on connection
	sendData();

	// Send data every 5 seconds
	const intervalId = setInterval(sendData, 5000);

	// Close the connection when the client disconnects
	req.on("close", () => {
		clearInterval(intervalId);
		res.end();
	});
};


export const getQuickStats = async (req, res) => {
	try {
		const totalRevenuePromise = Order.aggregate([
			{ $match: { status: "Delivered" } },
			{ $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
		]);

		const totalSalesPromise = Order.countDocuments({ status: "Delivered" });
		const totalUsersPromise = User.countDocuments();
		const totalProductsPromise = Product.countDocuments();

		const [revenueResult, totalSales, totalUsers, totalProducts] = await Promise.all([
			totalRevenuePromise,
			totalSalesPromise,
			totalUsersPromise,
			totalProductsPromise,
		]);

		const totalRevenue = revenueResult[0]?.totalRevenue || 0;

		res.json({
			totalRevenue,
			totalSales,
			totalUsers,
			totalProducts,
		});
	} catch (error) {
		res.status(500).json({ message: "Server Error", error: error.message });
	}
};