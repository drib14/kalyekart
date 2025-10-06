import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { paymongo } from "../lib/paymongo.js";
import { sendEmail } from "../lib/email.js";
import NotificationService from "../services/notification.service.js";

export const createPaymongoCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode, shippingAddress, distance, deliveryFee, contactNumber, paymentMethod } = req.body;
		const user = await User.findById(req.user._id);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let subtotal = 0;
		const lineItems = products.map((product) => {
			const amount = Math.round(product.price * 100);
			subtotal += amount * product.quantity;
			return {
				currency: "PHP",
				amount: amount,
				name: product.name,
				quantity: product.quantity || 1,
			};
		});

		let totalAmount = subtotal + Math.round(deliveryFee * 100);
		let coupon = null;
		let couponDetails = {};

		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				const discount = Math.round(totalAmount * (coupon.discountPercentage / 100));
				totalAmount -= discount;
				couponDetails = {
					code: coupon.code,
					discountPercentage: coupon.discountPercentage,
				};
			}
		}

		const session = await paymongo.checkoutSessions.create({
			data: {
				attributes: {
					billing: {
						name: user.name,
						email: user.email,
						phone: contactNumber,
					},
					payment_method_types: [paymentMethod],
					success_url: `${process.env.CLIENT_URL}/purchase-success`,
					cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
					line_items: lineItems,
					description: "KalyeKart Order",
					send_email_receipt: true,
					metadata: {
						userId: req.user._id.toString(),
						products: JSON.stringify(
							products.map((p) => ({
								product: p._id,
								quantity: p.quantity,
								price: p.price,
								name: p.name,
							}))
						),
						shippingAddress: JSON.stringify(shippingAddress),
						distance: String(distance),
						deliveryFee: String(deliveryFee),
						contactNumber: contactNumber,
						coupon: JSON.stringify(couponDetails),
						subtotal: String(subtotal / 100),
						totalAmount: String(totalAmount / 100),
						paymentMethod: paymentMethod,
					},
				},
			},
		});

		res.status(200).json({ id: session.data.id, url: session.data.attributes.checkout_url });
	} catch (error) {
		console.error("Error creating PayMongo checkout session:", error);
		res.status(500).json({ message: "Error creating PayMongo checkout session", error: error.message });
	}
};

export const verifyPaymongoPayment = async (req, res) => {
	try {
		const { sessionId } = req.body;
		const session = await paymongo.checkoutSessions.retrieve(sessionId);

		const paymentIntentId = session.data.attributes.payment_intent.id;
		const paymentIntent = await paymongo.paymentIntents.retrieve(paymentIntentId);

		if (paymentIntent.data.attributes.status === "succeeded") {
			const metadata = session.data.attributes.metadata;
			const {
				userId,
				coupon: couponString,
				products: productsString,
				shippingAddress: shippingAddressString,
				distance,
				deliveryFee,
				contactNumber,
				subtotal,
				totalAmount,
				paymentMethod,
			} = metadata;

			const existingOrder = await Order.findOne({ paymongoSessionId: sessionId });
			if (existingOrder) {
				if (existingOrder.paymentStatus === "paid") {
					return res.status(200).json({
						success: true,
						message: "Order already processed.",
						orderId: existingOrder._id,
					});
				} else {
					// If order exists but not paid, this is an inconsistent state.
					return res.status(400).json({ success: false, message: "Existing order is not marked as paid." });
				}
			}

			const coupon = JSON.parse(couponString);
			if (coupon && coupon.code) {
				await Coupon.findOneAndUpdate({ code: coupon.code, userId: userId }, { isActive: false });
			}

			const user = await User.findById(userId);
			const admin = await User.findOne({ role: "admin" });

			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			const products = JSON.parse(productsString);
			const shippingAddress = JSON.parse(shippingAddressString);

			const newOrder = new Order({
				user: userId,
				products: products.map((product) => ({
					product: product.product,
					quantity: product.quantity,
					price: product.price,
					name: product.name,
				})),
				subtotal: parseFloat(subtotal),
				totalAmount: parseFloat(totalAmount),
				coupon: coupon,
				paymongoSessionId: sessionId,
				shippingAddress,
				distance: parseFloat(distance),
				deliveryFee: parseFloat(deliveryFee),
				contactNumber,
				paymentMethod: paymentMethod,
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

			await sendEmail(
				user.email,
				`Your KalyeKart Order #${newOrder._id.toString().slice(-6)} is Confirmed!`,
				"orderConfirmation",
				{
					NAME: user.name,
					ORDER_ID: newOrder._id.toString(),
					ORDER_ITEMS: orderItemsHtml,
					SUBTOTAL: newOrder.subtotal.toFixed(2),
					DELIVERY_FEE: newOrder.deliveryFee.toFixed(2),
					TOTAL: newOrder.totalAmount.toFixed(2),
					CTA_LINK: `${process.env.CLIENT_URL}/my-orders/${newOrder._id}`,
				}
			);

			if (admin) {
				await sendEmail(
					process.env.EMAIL_USER,
					`New Order Received: #${newOrder._id.toString().slice(-6)}`,
					"adminNewOrderNotification",
					{
						ORDER_ID: newOrder._id.toString(),
						CUSTOMER_NAME: user.name,
						CUSTOMER_EMAIL: user.email,
						ORDER_ITEMS: orderItemsHtml,
						SUBTOTAL: newOrder.subtotal.toFixed(2),
						DELIVERY_FEE: newOrder.deliveryFee.toFixed(2),
						TOTAL: newOrder.totalAmount.toFixed(2),
						CTA_LINK: `${process.env.CLIENT_URL}/secret-dashboard`,
					}
				);
				const adminNotification = new Notification({
					recipient: admin._id,
					sender: user._id,
					type: "new_order",
					message: `${user.name} has placed a new order (#${newOrder._id.toString().slice(-6)}).`,
					link: `/order/${newOrder._id}`,
				});
				await adminNotification.save();
				await adminNotification.populate("sender", "name profilePicture");
				NotificationService.sendNotification(admin._id.toString(), adminNotification);
			}

			const customerNotification = new Notification({
				recipient: user._id,
				sender: admin ? admin._id : null,
				type: "new_order",
				message: `Your order #${newOrder._id.toString().slice(-6)} has been placed successfully!`,
				link: `/my-orders`,
			});
			await customerNotification.save();
			await customerNotification.populate("sender", "name profilePicture");
			NotificationService.sendNotification(user._id.toString(), customerNotification);

			if (newOrder.totalAmount >= 2000) {
				await createNewCoupon(user._id);
			}

			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id,
			});
		} else {
			res.status(400).json({ success: false, message: "Payment not successful." });
		}
	} catch (error) {
		console.error("Error verifying PayMongo payment:", error);
		res.status(500).json({ message: "Error verifying PayMongo payment", error: error.message });
	}
};

async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId, code: /GIFT/ });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();
	return newCoupon;
}