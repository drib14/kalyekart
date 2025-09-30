import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { stripe } from "../lib/stripe.js";
import { v4 as uuidv4 } from "uuid";
import { uploadOnCloudinary } from "../lib/cloudinary.js";
import { sendEmail } from "../lib/email.js";
import { getCoordinates, calculateHaversineDistance } from "../services/location.service.js";

const WAREHOUSE_COORDINATES = { lat: 10.2983, lon: 123.8991 };

export const createCodOrder = async (req, res) => {
	try {
		const {
			products,
			shippingAddress,
			contactNumber,
			couponCode,
			subtotal,
		} = req.body;
		const userId = req.user._id;
		const user = await User.findById(userId);
		const admin = await User.findOne({ role: "admin" });

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const fullAddress = `${shippingAddress.barangay}, ${shippingAddress.city}, Cebu, Philippines`;
		const coordinates = await getCoordinates(fullAddress);
		if (!coordinates) {
			return res.status(400).json({ message: "Could not determine coordinates for the provided address." });
		}
		const distance = calculateHaversineDistance(WAREHOUSE_COORDINATES.lat, WAREHOUSE_COORDINATES.lon, coordinates.lat, coordinates.lon);
		const baseFee = 15;
		const feePerKm = 5;
		const deliveryFee = Math.round(baseFee + (distance * feePerKm));
		const totalAmount = subtotal + deliveryFee;

		const newOrder = new Order({
			user: userId,
			products: products.map((p) => ({
				product: p._id,
				quantity: p.quantity,
				price: p.price,
				name: p.name,
			})),
			shippingAddress,
			contactNumber,
			paymentMethod: "cod",
			paymentStatus: "pending",
			couponCode,
			subtotal,
			deliveryFee,
			distance,
			totalAmount,
		});

		await newOrder.save();
		user.cartItems = [];
		await user.save();

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
				CTA_LINK: `https://kalyekart.app/my-orders/${newOrder._id}`,
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
					CTA_LINK: `https://kalyekart.app/secret-dashboard`,
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
		}

		const customerNotification = new Notification({
			recipient: user._id,
			sender: admin ? admin._id : null,
			type: "new_order",
			message: `Your order #${newOrder._id.toString().slice(-6)} has been placed successfully!`,
			link: `/my-orders`,
		});
		await customerNotification.save();

		res.status(201).json({ message: "Order created successfully", orderId: newOrder._id });
	} catch (error) {
		console.log("Error in createCodOrder controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getAllOrders = async (req, res) => {
	try {
		const orders = await Order.find()
			.populate({
				path: "products.product",
				select: "name image",
			})
			.populate("user", "name")
			.sort({ createdAt: -1 });
		res.json(orders);
	} catch (error) {
		console.log("Error in getAllOrders controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const cancelOrder = async (req, res) => {
	try {
		const { orderId } = req.params;
		const { cancellationReason } = req.body;
		const admin = await User.findOne({ role: "admin" });

		const order = await Order.findById(orderId).populate("user", "name email");
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		if (order.user._id.toString() !== req.user._id.toString()) {
			return res.status(401).json({ message: "Not authorized to cancel this order" });
		}

		order.status = "Cancelled";
		const reason = cancellationReason || "Order cancelled by user.";
		order.cancellationReason = reason;
		await order.save();

		if (admin) {
			await sendEmail(
				process.env.EMAIL_USER,
				`Order #${order._id.toString().slice(-6)} has been Cancelled`,
				"adminOrderCancelled",
				{
					ORDER_ID: order._id.toString(),
					CUSTOMER_NAME: order.user.name,
					CANCELLATION_REASON: reason,
					CTA_LINK: `https://kalyekart.app/secret-dashboard`,
				}
			);
			const adminNotification = new Notification({
				recipient: admin._id,
				sender: order.user._id,
				type: "order_cancelled",
				message: `Order #${order._id.toString().slice(-6)} has been cancelled by ${order.user.name}.`,
				link: `/order/${order._id}`,
			});
			await adminNotification.save();
		}

		await sendEmail(
			order.user.email,
			`Your KalyeKart Order #${order._id.toString().slice(-6)} Has Been Cancelled`,
			"customerOrderCancelled",
			{
				NAME: order.user.name,
				ORDER_ID: order._id.toString(),
				CTA_LINK: `https://kalyekart.app`,
			}
		);

		const customerNotification = new Notification({
			recipient: order.user._id,
			sender: admin ? admin._id : null,
			type: "order_cancelled",
			message: `Your order #${order._id.toString().slice(-6)} has been successfully cancelled.`,
			link: `/my-orders`,
		});
		await customerNotification.save();

		res.json({ message: "Order cancelled successfully", order });
	} catch (error) {
		console.log("Error in cancelOrder controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getOrderById = async (req, res) => {
	try {
		const order = await Order.findById(req.params.orderId)
			.populate("products.product")
			.populate("user", "name email");

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
			return res.status(401).json({ message: "Not authorized" });
		}

		res.json(order);
	} catch (error) {
		console.log("Error in getOrderById controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const createStripeCheckoutSession = async (req, res) => {
	try {
		const { products, shippingAddress, contactNumber, couponCode, subtotal } =
			req.body;
		const idempotencyKey = uuidv4();

		const fullAddress = `${shippingAddress.barangay}, ${shippingAddress.city}, Cebu, Philippines`;
		const coordinates = await getCoordinates(fullAddress);
		if (!coordinates) {
			return res.status(400).json({ message: "Could not determine coordinates for the provided address." });
		}
		const distance = calculateHaversineDistance(WAREHOUSE_COORDINATES.lat, WAREHOUSE_COORDINATES.lon, coordinates.lat, coordinates.lon);
		const baseFee = 15;
		const feePerKm = 5;
		const deliveryFee = Math.round(baseFee + (distance * feePerKm));
		const totalAmount = subtotal + deliveryFee;

		const line_items = products.map((product) => ({
			price_data: {
				currency: "php",
				product_data: {
					name: product.name,
					images: [product.image],
				},
				unit_amount: product.price * 100,
			},
			quantity: product.quantity,
		}));

		if (deliveryFee > 0) {
			line_items.push({
				price_data: {
					currency: "php",
					product_data: {
						name: "Delivery Fee",
					},
					unit_amount: deliveryFee * 100,
				},
				quantity: 1,
			});
		}

		const session = await stripe.checkout.sessions.create(
			{
				payment_method_types: ["card"],
				line_items,
				mode: "payment",
				success_url: `https://kalyekart.app/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `https://kalyekart.app/purchase-cancel`,
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
					contactNumber,
					paymentMethod: "card",
					couponCode,
					subtotal,
					deliveryFee,
					distance,
					totalAmount,
				},
			},
			{ idempotencyKey }
		);

		res.json({ id: session.id });
	} catch (error) {
		console.log("Error in createStripeCheckoutSession controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getOrders = async (req, res) => {
	try {
		const orders = await Order.find({ user: req.user._id })
			.populate({
				path: "products.product",
				select: "name image",
			})
			.sort({ createdAt: -1 });
		res.json(orders);
	} catch (error) {
		console.log("Error in getOrders controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateOrderStatus = async (req, res) => {
	try {
		const { orderId } = req.params;
		const { status } = req.body;
		const admin = await User.findOne({ role: "admin" });

		const order = await Order.findById(orderId).populate("user", "name email");
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		if (order.status === status) {
			return res.json(order);
		}

		order.status = status;
		await order.save();

		if (order.user && order.user.email) {
			await sendEmail(
				order.user.email,
				`Your KalyeKart Order #${order._id.toString().slice(-6)} has been updated!`,
				"orderUpdate",
				{
					NAME: order.user.name,
					ORDER_ID: order._id.toString(),
					NEW_STATUS: status,
					CTA_LINK: `https://kalyekart.app/my-orders/${order._id}`,
				}
			);
		}

		const customerNotification = new Notification({
			recipient: order.user._id,
			sender: admin ? admin._id : null,
			type: "order_status_update",
			message: `The status of your order #${order._id.toString().slice(-6)} has been updated to ${status}.`,
			link: `/my-orders`,
		});
		await customerNotification.save();

		res.json(order);
	} catch (error) {
		console.log("Error in updateOrderStatus controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const requestRefund = async (req, res) => {
	try {
		const { orderId } = req.params;
		const { reason } = req.body;
		const admin = await User.findOne({ role: "admin" });

		if (!req.file) {
			return res.status(400).json({ message: "Proof of image is required." });
		}

		const order = await Order.findById(orderId).populate("user", "name email");
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		const proofUpload = await uploadOnCloudinary(req.file, "kalyekart_refunds");

		if (!proofUpload) {
			return res.status(500).json({ message: "Failed to upload proof to Cloudinary." });
		}

		order.refundRequest = {
			reason,
			proof: proofUpload.secure_url,
			status: "pending",
		};
		await order.save();

		if (admin) {
			await sendEmail(
				process.env.EMAIL_USER,
				`Refund Requested for Order #${order._id.toString().slice(-6)}`,
				"adminRefundRequested",
				{
					ORDER_ID: order._id.toString(),
					CUSTOMER_NAME: order.user.name,
					REFUND_REASON: reason,
					CTA_LINK: `https://kalyekart.app/secret-dashboard`,
				}
			);
			const adminNotification = new Notification({
				recipient: admin._id,
				sender: order.user._id,
				type: "refund_request",
				message: `${order.user.name} has requested a refund for order #${order._id.toString().slice(-6)}.`,
				link: `/order/${order._id}`,
			});
			await adminNotification.save();
		}

		await sendEmail(
			order.user.email,
			`We've Received Your Refund Request for Order #${order._id.toString().slice(-6)}`,
			"customerRefundRequested",
			{
				NAME: order.user.name,
				ORDER_ID: order._id.toString(),
				CTA_LINK: `https://kalyekart.app/my-orders/${order._id}`,
			}
		);

		const customerNotification = new Notification({
			recipient: order.user._id,
			sender: admin ? admin._id : null,
			type: "refund_request",
			message: `Your refund request for order #${order._id.toString().slice(-6)} has been submitted.`,
			link: `/my-orders`,
		});
		await customerNotification.save();

		res.json(order);
	} catch (error) {
		console.log("Error in requestRefund controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getRefunds = async (req, res) => {
	try {
		const orders = await Order.find({ "refundRequest.status": "pending" }).sort({ createdAt: -1 });
		res.json(orders);
	} catch (error) {
		console.log("Error in getRefunds controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateRefundStatus = async (req, res) => {
	try {
		const { orderId } = req.params;
		const { status, rejectionReason } = req.body;
		const admin = await User.findOne({ role: "admin" });

		const order = await Order.findById(orderId).populate("user", "name email");
		if (!order) {
			return res.status(404).json({ message: "Refund request not found" });
		}

		if (order.refundRequest.status === status) {
			return res.status(400).json({ message: `Refund is already ${status}.` });
		}

		order.refundRequest.status = status;
		if (status === "rejected") {
			order.refundRequest.rejectionReason = rejectionReason;
		}

		if (status === "approved" && order.paymentMethod === "card" && order.stripeSessionId) {
			try {
				const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
				if (!session.payment_intent) {
					throw new Error("Could not find Payment Intent for this order.");
				}
				await stripe.refunds.create({ payment_intent: session.payment_intent });
				order.paymentStatus = "refunded";
			} catch (stripeError) {
				console.error("Stripe refund failed:", stripeError);
				return res.status(500).json({ message: "Stripe refund failed. Please process manually.", error: stripeError.message });
			}
		} else if (status === "approved" && order.paymentMethod === "cod") {
			order.paymentStatus = "refunded";
		}

		await order.save();

		const emailData = {
			NAME: order.user.name,
			ORDER_ID: order._id.toString(),
			STATUS: status.charAt(0).toUpperCase() + status.slice(1),
			STATUS_CLASS: status,
			CTA_LINK: `https://kalyekart.app/my-orders/${order._id}`,
			REJECTION_REASON_STYLE: status === "rejected" ? "" : "display: none;",
			REJECTION_REASON: rejectionReason || "",
			STATUS_MESSAGE:
				status === "approved"
					? "Your refund has been processed. If you paid by card, the amount should reflect in your account within 5-10 business days."
					: "We're sorry, but we couldn't approve your refund request at this time. Please contact support if you believe this is a mistake.",
		};

		await sendEmail(
			order.user.email,
			`Update on your Refund Request for Order #${order._id.toString().slice(-6)}`,
			"refundStatusUpdate",
			emailData
		);

		const customerNotification = new Notification({
			recipient: order.user._id,
			sender: admin ? admin._id : null,
			type: "refund_status_update",
			message: `Your refund request for order #${order._id.toString().slice(-6)} has been ${status}.`,
			link: `/my-orders`,
		});
		await customerNotification.save();

		res.json(order);
	} catch (error) {
		console.log("Error in updateRefundStatus controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updatePaymentStatus = async (req, res) => {
	try {
		const { orderId } = req.params;
		const { paymentStatus } = req.body;

		if (!paymentStatus) {
			return res.status(400).json({ message: "Payment status is required." });
		}

		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		order.paymentStatus = paymentStatus;
		await order.save();
		res.json(order);
	} catch (error) {
		console.log("Error in updatePaymentStatus controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};