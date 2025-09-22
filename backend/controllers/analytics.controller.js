import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalyticsData = async () => {
	const totalUsers = await User.countDocuments();
	const totalProducts = await Product.countDocuments();

	const salesData = await Order.aggregate([
		{
			$match: {
				status: "delivered",
			},
		},
		{
			$group: {
				_id: null, // it groups all documents together,
				totalSales: { $sum: 1 },
				totalRevenue: { $sum: "$totalAmount" },
			},
		},
	]);

	const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

	return {
		users: totalUsers,
		products: totalProducts,
		totalSales,
		totalRevenue,
	};
};

export const getDailySalesData = async (startDate, endDate) => {
	try {
		const dailySalesData = await Order.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
					status: "delivered",
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

export const getCancelledOrdersAnalytics = async () => {
	const cancelledData = await Order.aggregate([
		{
			$match: {
				status: "cancelled",
			},
		},
		{
			$group: {
				_id: null,
				totalCancelledOrders: { $sum: 1 },
				totalCancelledRevenue: { $sum: "$totalAmount" },
			},
		},
	]);

	const { totalCancelledOrders, totalCancelledRevenue } = cancelledData[0] || {
		totalCancelledOrders: 0,
		totalCancelledRevenue: 0,
	};

	return {
		totalCancelledOrders,
		totalCancelledRevenue,
	};
};

export const getRefundedOrdersAnalytics = async () => {
	const refundedData = await Order.aggregate([
		{
			$match: {
				"refundRequest.status": "approved",
			},
		},
		{
			$group: {
				_id: null,
				totalRefundedOrders: { $sum: 1 },
				totalRefundedRevenue: { $sum: "$totalAmount" },
			},
		},
	]);

	const { totalRefundedOrders, totalRefundedRevenue } = refundedData[0] || {
		totalRefundedOrders: 0,
		totalRefundedRevenue: 0,
	};

	return {
		totalRefundedOrders,
		totalRefundedRevenue,
	};
};
