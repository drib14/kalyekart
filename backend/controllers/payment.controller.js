import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";
import { paymongo } from "../lib/paymongo.js";

export const createCheckoutSession = async (req, res) => {
	const { products, couponCode, paymentMethod, billing } = req.body;

	if (!Array.isArray(products) || products.length === 0) {
		return res.status(400).json({ error: "Invalid or empty products array" });
	}

	let totalAmount = products.reduce((acc, product) => acc + product.price * product.quantity, 0);

	let coupon = null;
	if (couponCode) {
		coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
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
		return res.status(201).json({ message: "Order placed successfully", orderId: newOrder._id });
	}

	const lineItems = products.map((product) => ({
		currency: "PHP",
		amount: Math.round(product.price * 100), // amount in cents
		description: product.description,
		name: product.name,
		quantity: product.quantity,
	}));

	try {
		const session = await paymongo.checkout.create({
			success_url: `${process.env.CLIENT_URL}/purchase-success`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
			line_items: lineItems,
			payment_method_types: ["card", "gcash", "paymaya"],
			billing: {
				name: billing.name,
				email: billing.email,
				phone: billing.phone,
				address: {
					line1: billing.address.line1,
					city: billing.address.city,
					state: billing.address.state,
					postal_code: billing.address.postal_code,
					country: "PH",
				},
			},

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
			},
		});

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}

		res.status(200).json({ checkout_url: session.checkout_url });
	} catch (error) {
		console.error("Error processing checkout:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

export const paymongoWebhook = async (req, res) => {
	try {
		// NOTE: Add webhook signature verification in production
		const event = req.body;
		if (event.data.attributes.type === "checkout.session.payment.paid") {
			const session = event.data.attributes.data;
			const metadata = session.attributes.metadata;
			const payment = session.attributes.payments[0];

			if (metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{ code: metadata.couponCode, userId: metadata.userId },
					{ isActive: false }
				);
			}

			const products = JSON.parse(metadata.products);
			const newOrder = new Order({
				user: metadata.userId,
				products: products.map((product) => ({
					product: product.id,
					quantity: product.quantity,
					price: product.price,
				})),
				totalAmount: payment.attributes.amount / 100,
				paymentMethod: payment.attributes.source.type,
				paymongoCheckoutId: session.id,
				billing: session.attributes.billing,
			});

			await newOrder.save();
		}
		res.status(200).json({ received: true });
	} catch (error) {
		console.error("Error processing PayMongo webhook:", error);
		res.status(500).json({ message: "Error processing webhook" });
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
