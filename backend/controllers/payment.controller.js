import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";
import { paymongoClient } from "../lib/paymongo.js";

export const createPayment = async (req, res) => {
	const { products, couponCode, paymentMethod, billing } = req.body;

	if (!Array.isArray(products) || products.length === 0) {
		return res.status(400).json({ error: "Invalid or empty products array" });
	}

	let totalAmount = products.reduce((acc, product) => acc + product.price * product.quantity, 0);

	if (couponCode) {
		const coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
		if (coupon) {
			totalAmount -= (totalAmount * coupon.discountPercentage) / 100;
		}
	}

	if (paymentMethod === "cod") {
		// Handle Cash on Delivery
		const newOrder = new Order({
			user: req.user._id,
			products: products.map((p) => ({
				product: p._id,
				quantity: p.quantity,
				price: p.price,
			})),
			totalAmount,
			paymentMethod: "cod",
			billing,
		});

		await newOrder.save();
		if (couponCode) {
			await Coupon.findOneAndUpdate({ code: couponCode, userId: req.user._id }, { isActive: false });
		}
		return res.status(201).json({ message: "Order placed successfully", orderId: newOrder._id });
	}

	// Handle PayMongo Payment
	try {
		const paymentIntent = await paymongoClient.paymentIntents.create({
			amount: Math.round(totalAmount * 100), // amount in cents
			payment_method_allowed: ["card", "gcash", "paymaya"],
			payment_method_options: {
				card: {
					request_three_d_secure: "any",
				},
			},
			currency: "PHP",
			description: "Payment for KalyeKart order",
			statement_descriptor: "KalyeKart",
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
				billing: JSON.stringify(billing),
			},
		});

		// Create order in pending state
		const newOrder = new Order({
			user: req.user._id,
			products: products.map((p) => ({
				product: p._id,
				quantity: p.quantity,
				price: p.price,
			})),
			totalAmount,
			paymentMethod: "paymongo",
			paymentStatus: "pending",
			billing,
			paymongoPaymentIntentId: paymentIntent.id,
		});
		await newOrder.save();

		res.status(200).json({ clientKey: paymentIntent.attributes.client_key, orderId: newOrder._id });
	} catch (error) {
		console.error("Error creating Payment Intent:", error);
		res.status(500).json({ message: "Error creating Payment Intent", error: error.message });
	}
};

export const verifyPayment = async (req, res) => {
	try {
		const { orderId, paymentIntentId } = req.body;
		const paymentIntent = await paymongoClient.paymentIntents.retrieve(paymentIntentId);

		if (paymentIntent.attributes.status === "succeeded") {
			const order = await Order.findByIdAndUpdate(
				orderId,
				{ paymentStatus: "paid" },
				{ new: true }
			);

			if (order.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{ code: order.metadata.couponCode, userId: order.user },
					{ isActive: false }
				);
			}
			res.status(200).json({ success: true, message: "Payment verified successfully" });
		} else {
			res.status(400).json({ success: false, message: "Payment not successful" });
		}
	} catch (error) {
		console.error("Error verifying payment:", error);
		res.status(500).json({ message: "Error verifying payment", error: error.message });
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
