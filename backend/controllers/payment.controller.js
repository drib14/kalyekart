import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

export const createCodOrder = async (req, res) => {
	try {
		const { products, couponCode, totalAmount } = req.body;

		if (couponCode) {
			await Coupon.findOneAndUpdate(
				{
					code: couponCode,
					userId: req.user._id,
				},
				{
					isActive: false,
				}
			);
		}

		const newOrder = new Order({
			user: req.user._id,
			products: products.map((product) => ({
				product: product._id,
				quantity: product.quantity,
				price: product.price,
			})),
			totalAmount: totalAmount,
			paymentMethod: "COD",
			status: "Pending",
		});

		await newOrder.save();

		if (totalAmount >= 200) {
			await createNewCoupon(req.user._id);
		}

		res.status(201).json({
			success: true,
			message: "Order placed successfully via Cash on Delivery.",
			orderId: newOrder._id,
		});
	} catch (error) {
		console.error("Error creating COD order:", error);
		res.status(500).json({ message: "Error creating COD order", error: error.message });
	}
};


async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}
