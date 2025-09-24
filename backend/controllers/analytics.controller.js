import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalyticsData = async () => {
	try {
		const totalUsers = await User.countDocuments({ role: "customer" });
		const totalProducts = await Product.countDocuments();

		const salesData = await Order.aggregate([
			{
				$match: { status: "delivered" },
			},
			{
				$group: {
					_id: null,
					totalSales: { $sum: 1 },
					totalRevenue: { $sum: "$totalAmount" },
				},
			},
		]);

		const cancelledOrders = await Order.countDocuments({ status: "cancelled" });
		const refundedOrders = await Order.countDocuments({ "refundRequest.status": "approved" });

		const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

		return {
			users: totalUsers,
			products: totalProducts,
			totalSales,
			totalRevenue,
			cancelledOrders,
			refundedOrders,
		};
	} catch (error) {
		console.error("Error in getAnalyticsData:", error);
		return {
			users: 0,
			products: 0,
			totalSales: 0,
			totalRevenue: 0,
			cancelledOrders: 0,
			refundedOrders: 0,
		};
	}
};

export const getDailySalesData = async (startDate, endDate) => {
	try {
		const dailySalesData = await Order.aggregate([
			{
				$match: {
					status: "delivered",
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
				},
			},
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					sales: { $sum: 1 },
					revenue: { $sum: "$totalAmount" },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		// example of dailySalesData
		// [
		// 	{
		// 		_id: "2024-08-18",
		// 		sales: 12,
		// 		revenue: 1450.75
		// 	},
		// ]

		const dateArray = getDatesInRange(startDate, endDate);
		// console.log(dateArray) // ['2024-08-18', '2024-08-19', ... ]

		return dateArray.map((date) => {
			const foundData = dailySalesData.find((item) => item._id === date);

			return {
				date,
				sales: foundData?.sales || 0,
				revenue: foundData?.revenue || 0,
			};
		});
	} catch (error) {
		throw error;
	}
};

function getDatesInRange(startDate, endDate) {
	const dates = [];
	let currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		dates.push(currentDate.toISOString().split("T")[0]);
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
}

export const streamAnalyticsData = async (req, res) => {
	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();

	let lastSentData = null;

	const sendData = async () => {
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

			const dataToSend = JSON.stringify({ analyticsData, dailySalesData });

			if (dataToSend !== lastSentData) {
				res.write(`data: ${dataToSend}\n\n`);
				lastSentData = dataToSend;
			}
		} catch (error) {
			console.error("Error fetching analytics data for SSE:", error);
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
