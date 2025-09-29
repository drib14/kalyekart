import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { stripe } from "../lib/stripe.js";
import { sendEmail } from "../lib/email.js";

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode, shippingAddress, distance, deliveryFee } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let totalAmount = 0;

		const lineItems = products.map((product) => {
			const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
			totalAmount += amount * product.quantity;

			return {
				price_data: {
					currency: "php",
					product_data: {
						name: product.name,
						images: [product.image],
					},
					unit_amount: amount,
				},
				quantity: product.quantity || 1,
			};
		});

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `https://kalyekart.app/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `https://kalyekart.app/purchase-cancel`,
			discounts: coupon
				? [
						{
							coupon: await createStripeCoupon(coupon.discountPercentage),
						},
				  ]
				: [],
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
				shippingAddress: JSON.stringify(shippingAddress),
				distance: String(distance),
				deliveryFee: String(deliveryFee),
			},
		});

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}
		res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
	} catch (error) {
		console.error("Error processing checkout:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;
		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.payment_status === "paid") {
			if (session.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: session.metadata.couponCode,
						userId: session.metadata.userId,
					},
					{
						isActive: false,
					}
				);
			}

			const user = await User.findById(session.metadata.userId);
			if (!user) {
				// This should ideally not happen if the session was created correctly
				return res.status(404).json({ message: "User not found" });
			}

			// create a new Order
			const products = JSON.parse(session.metadata.products);
			const shippingAddress = JSON.parse(session.metadata.shippingAddress);
			const distance = parseFloat(session.metadata.distance);
			const deliveryFee = parseFloat(session.metadata.deliveryFee);
			const newOrder = new Order({
				user: session.metadata.userId,
				products: products.map((product) => ({
					product: product.product, // Corrected from product.id
					quantity: product.quantity,
					price: product.price,
					name: product.name, // Added product name
				})),
				totalAmount: session.amount_total / 100, // convert from cents to dollars,
				stripeSessionId: sessionId,
				shippingAddress,
				distance,
				deliveryFee,
				paymentMethod: "card",
				paymentStatus: "paid",
			});

			await newOrder.save();

			const orderItemsHtml = products
				.map(
					(item) => `
				<tr>
					<td>${item.name}</td>
					<td>${item.quantity}</td>
					<td>₱${item.price.toFixed(2)}</td>
				</tr>
			`
				)
				.join("");

			// Send confirmation email to customer
			await sendEmail(
				user.email,
				`Your KalyeKart Order #${newOrder._id.toString().slice(-6)} is Confirmed!`,
				"orderConfirmation",
				{
					NAME: user.name,
					ORDER_ID: newOrder._id.toString(),
					ORDER_ITEMS: orderItemsHtml,
					SUBTOTAL: (newOrder.totalAmount - newOrder.deliveryFee).toFixed(2),
					DELIVERY_FEE: newOrder.deliveryFee.toFixed(2),
					TOTAL: newOrder.totalAmount.toFixed(2),
					CTA_LINK: `https://kalyekart.app/my-orders/${newOrder._id}`,
				}
			);

			// Send notification email to admin
			console.log(`[ADMIN EMAIL LOG] Attempting to send new Stripe order notification to: ${process.env.ADMIN_EMAIL}`);
			await sendEmail(
				process.env.ADMIN_EMAIL,
				`New Order Received: #${newOrder._id.toString().slice(-6)}`,
				"adminNewOrderNotification",
				{
					ORDER_ID: newOrder._id.toString(),
					CUSTOMER_NAME: user.name,
					CUSTOMER_EMAIL: user.email,
					ORDER_ITEMS: orderItemsHtml,
					TOTAL: newOrder.totalAmount.toFixed(2),
					CTA_LINK: `https://kalyekart.app/secret-dashboard`,
				}
			);

			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id,
			});
		}
	} catch (error) {
		console.error("Error processing successful checkout:", error);
		res.status(500).json({ message: "Error processing successful checkout", error: error.message });
	}
};

async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});

	return coupon.id;
}

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
