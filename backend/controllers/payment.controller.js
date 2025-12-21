import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";
import axios from "axios";
import { sendOrderConfirmationEmail } from "../lib/email.js";

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode, address } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		if (!address) {
			return res.status(400).json({ error: "Delivery address is required" });
		}

		let totalAmount = 0;
		const lineItems = products.map((product) => {
			const amount = Math.round(product.price * 100); // PayMongo wants cents
			totalAmount += amount * product.quantity;

			return {
				name: product.name,
				amount: amount,
				currency: "PHP",
				quantity: product.quantity || 1,
				images: [product.image],
			};
		});

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				const discountAmount = Math.round((totalAmount * coupon.discountPercentage) / 100);
				totalAmount -= discountAmount;
			}
		}

		// PayMongo checkout session creation
		const options = {
			method: "POST",
			url: "https://api.paymongo.com/v1/checkout_sessions",
			headers: {
				accept: "application/json",
				"Content-Type": "application/json",
				authorization: `Basic ${btoa(process.env.PAYMONGO_SECRET_KEY + ":")}`,
			},
			data: {
				data: {
					attributes: {
						line_items: lineItems,
						payment_method_types: ["card", "gcash", "paymaya"],
						success_url: `${process.env.CLIENT_URL}/purchase-success`,
						cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
						description: "Purchase from KalyeKart",
						send_email_receipt: true,
						show_description: true,
						show_line_items: true,
						metadata: {
							userId: req.user._id.toString(),
							couponCode: couponCode || "",
							address: address, // Store address in metadata
							products: JSON.stringify(
								products.map((p) => ({
									id: p._id,
									quantity: p.quantity,
									price: p.price,
								}))
							),
						},
					},
				},
			},
		};

		const response = await axios.request(options);
		const session = response.data.data;

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}

		res.status(200).json({ id: session.id, checkoutUrl: session.attributes.checkout_url, totalAmount: totalAmount / 100 });
	} catch (error) {
		console.error("Error processing checkout:", error.response ? error.response.data : error.message);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;

		// Retrieve session from PayMongo
		const options = {
			method: 'GET',
			url: `https://api.paymongo.com/v1/checkout_sessions/${sessionId}`,
			headers: {
				accept: 'application/json',
				authorization: `Basic ${btoa(process.env.PAYMONGO_SECRET_KEY + ":")}`
			}
		};

		const response = await axios.request(options);
		const session = response.data.data;

		// Check if paid
		const payments = session.attributes.payments;
		const isPaid = payments && payments.length > 0 && payments.some(p => p.attributes.status === 'paid');

		if (isPaid) {
			const metadata = session.attributes.metadata;

			// Deactivate coupon if used
			if (metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: metadata.couponCode,
						userId: metadata.userId,
					},
					{
						isActive: false,
					}
				);
			}

			// create a new Order
			const products = JSON.parse(metadata.products);

			// Check if order already exists
			const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
			if (existingOrder) {
				 return res.status(200).json({
					success: true,
					message: "Order already exists.",
					orderId: existingOrder._id,
				});
			}

			// Calculate total amount from payments
			const totalAmount = payments.reduce((acc, curr) => acc + curr.attributes.amount, 0) / 100;

			const newOrder = new Order({
				user: metadata.userId,
				products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
				totalAmount: totalAmount,
				stripeSessionId: sessionId,
				deliveryAddress: metadata.address || "No address provided", // Retrieve address
			});

			await newOrder.save();

			// Send confirmation email (async, don't block response)
			// Using the email from req.user (middleware should populate it) or fetch user if needed.
			// Since req.user is usually populated by auth middleware, we check.
			// But checkoutSuccess might be called from frontend which has auth token, so req.user exists.
			if (req.user && req.user.email) {
				sendOrderConfirmationEmail(req.user.email, newOrder._id, totalAmount, newOrder.products)
					.catch(err => console.error("Error sending confirmation email:", err));
			}

			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id,
			});
		} else {
			res.status(400).json({ message: "Payment not verified or incomplete." });
		}
	} catch (error) {
		console.error("Error processing successful checkout:", error.response ? error.response.data : error.message);
		res.status(500).json({ message: "Error processing successful checkout", error: error.message });
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
