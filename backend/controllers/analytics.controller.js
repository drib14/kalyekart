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
	// --- Timeframe for Filtered Stats ---
	const { startDate: filteredStartDate, endDate: filteredEndDate } = getAnalyticsTimeframe(filter);

	// --- Dynamic Grouping for Overall Graph ---
	const firstOrder = await Order.findOne().sort({ createdAt: 1 }).lean();
	let overallGroupByFormat;

	if (firstOrder) {
		const now = new Date();
		const firstOrderDate = new Date(firstOrder.createdAt);
		const diffTime = Math.abs(now - firstOrderDate);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays <= 90) {
			overallGroupByFormat = "%Y-%m-%d"; // Daily
		} else if (diffDays <= 1095) { // Up to 3 years
			overallGroupByFormat = "%Y-%m"; // Monthly
		} else {
			overallGroupByFormat = "%Y"; // Yearly
		}
	} else {
		overallGroupByFormat = "%Y"; // Default if no orders
	}


	// Defines the condition for an order to be considered refunded
	const refundCondition = {
		$or: [{ $eq: ["$paymentStatus", "refunded"] }, { $eq: ["$refundRequest.status", "approved"] }],
	};

	// --- Promises ---

	// 1. Promise for FILTERED stats (sales and revenue)
	const filteredStatsPromise = Order.aggregate([
		{
			$match: {
				status: "Delivered",
				createdAt: { $gte: filteredStartDate, $lte: filteredEndDate },
			},
		},
		{
			$group: {
				_id: null,
				totalSales: { $sum: 1 },
				totalRevenue: {
					$sum: {
						$cond: { if: refundCondition, then: 0, else: "$totalAmount" },
					},
				},
			},
		},
	]);

	// 2. Promise for OVERALL graph data with dynamic grouping
	const overallGraphDataPromise = Order.aggregate([
		{
			$match: {
				status: "Delivered",
			},
		},
		{
			$group: {
				_id: { $dateToString: { format: overallGroupByFormat, date: "$createdAt" } },
				sales: { $sum: 1 },
				revenue: {
					$sum: {
						$cond: { if: refundCondition, then: 0, else: "$totalAmount" },
					},
				},
			},
		},
		{ $sort: { _id: 1 } },
	]);

	// 3. Promises for OVERALL stats (users and products)
	const totalUsersPromise = User.countDocuments();
	const totalProductsPromise = Product.countDocuments();

	// --- Execution ---
	const [filteredStatsResult, overallGraphDataResult, totalUsers, totalProducts] =
		await Promise.all([
			filteredStatsPromise,
			overallGraphDataPromise,
			totalUsersPromise,
			totalProductsPromise,
		]);

	// --- Formatting ---
	const { totalSales: filteredSales = 0, totalRevenue: filteredRevenue = 0 } =
		filteredStatsResult[0] || {};

	return {
		filteredStats: {
			totalSales: filteredSales,
			totalRevenue: filteredRevenue,
		},
		overallStats: {
			totalUsers,
			totalProducts,
		},
		overallGraphData: overallGraphDataResult.map((item) => ({
			name: item._id,
			sales: item.sales,
			revenue: item.revenue,
		})),
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
		const refundCondition = {
			$or: [{ $eq: ["$paymentStatus", "refunded"] }, { $eq: ["$refundRequest.status", "approved"] }],
		};

		const totalRevenuePromise = Order.aggregate([
			{ $match: { status: "Delivered" } },
			{
				$group: {
					_id: null,
					totalRevenue: {
						$sum: {
							$cond: { if: refundCondition, then: 0, else: "$totalAmount" },
						},
					},
				},
			},
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