import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";

export const createCodOrder = async (req, res) => {
	try {
		const { products, couponCode, shippingAddress, contactNumber } = req.body;
		const userId = req.user._id;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let totalAmount = products.reduce((acc, product) => acc + product.price * product.quantity, 0);

		if (couponCode) {
			const coupon = await Coupon.findOne({ code: couponCode, userId, isActive: true });
			if (coupon) {
				totalAmount -= (totalAmount * coupon.discountPercentage) / 100;
				await Coupon.findOneAndUpdate({ code: couponCode, userId }, { isActive: false });
			}
		}

		const newOrder = new Order({
			user: userId,
			products: products.map((p) => ({
				product: p._id,
				quantity: p.quantity,
				price: p.price,
			})),
			totalAmount,
			shippingAddress,
			contactNumber,
			paymentMethod: "cod",
			paymentStatus: "pending",
		});

		await newOrder.save();
		res.status(201).json({ message: "Order placed successfully", orderId: newOrder._id });
	} catch (error) {
		console.error("Error creating COD order:", error);
		res.status(500).json({ message: "Error creating COD order", error: error.message });
	}
};
