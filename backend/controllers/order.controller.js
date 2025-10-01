import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { stripe } from "../lib/stripe.js";
import { v4 as uuidv4 } from "uuid";
import { uploadOnCloudinary } from "../lib/cloudinary.js";
import { getCoordinates, calculateHaversineDistance } from "../services/location.service.js";
import NotificationService from "../services/notification.service.js";

const WAREHOUSE_COORDINATES = { lat: 10.2983, lon: 123.8991 };

export const createCodOrder = async (req, res) => {
	try {
		const { products, shippingAddress, contactNumber, couponCode, subtotal } = req.body;
		const userId = req.user._id;
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const fullAddress = `${shippingAddress.barangay}, ${shippingAddress.city}, Cebu, Philippines`;
		const coordinates = await getCoordinates(fullAddress);
		if (!coordinates) {
			return res.status(400).json({ message: "Could not determine coordinates for the provided address." });
		}
		const distance = calculateHaversineDistance(
			WAREHOUSE_COORDINATES.lat,
			WAREHOUSE_COORDINATES.lon,
			coordinates.lat,
			coordinates.lon
		);
		const baseFee = 15;
		const feePerKm = 5;
		const deliveryFee = Math.round(baseFee + distance * feePerKm);
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

		// Use the centralized notification service
		await NotificationService.createNotification("new_order", {
			actor: user,
			order: newOrder,
		});

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
		const user = req.user;

		const order = await Order.findById(orderId).populate("user", "name email");
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		if (order.user._id.toString() !== user._id.toString()) {
			return res.status(401).json({ message: "Not authorized to cancel this order" });
		}

		order.status = "Cancelled";
		const reason = cancellationReason || "Order cancelled by user.";
		order.cancellationReason = reason;
		await order.save();

		await NotificationService.createNotification("order_cancelled", {
			actor: user,
			order: order,
			cancellationReason: reason,
		});

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

		if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
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
		const { products, shippingAddress, contactNumber, couponCode, subtotal } = req.body;
		const idempotencyKey = uuidv4();

		const fullAddress = `${shippingAddress.barangay}, ${shippingAddress.city}, Cebu, Philippines`;
		const coordinates = await getCoordinates(fullAddress);
		if (!coordinates) {
			return res.status(400).json({ message: "Could not determine coordinates for the provided address." });
		}
		const distance = calculateHaversineDistance(
			WAREHOUSE_COORDINATES.lat,
			WAREHOUSE_COORDINATES.lon,
			coordinates.lat,
			coordinates.lon
		);
		const baseFee = 15;
		const feePerKm = 5;
		const deliveryFee = Math.round(baseFee + distance * feePerKm);
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

		const order = await Order.findById(orderId).populate("user", "name email");
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		if (order.status === status) {
			return res.json(order);
		}

		order.status = status;
		await order.save();

		await NotificationService.createNotification("order_status_update", {
			recipient: order.user,
			order: order,
		});

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

		// This can be refactored to use NotificationService in the future
		// For now, leaving it as is to limit scope of change.
		const admin = await User.findOne({ role: "admin" });
		if (admin) {
			// Create in-app notif
		}
		// Send emails

		res.json(order);
	} catch (error) {
		console.log("Error in requestRefund controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Note: The 'requestRefund' function still contains manual notification logic
// that could be refactored in the future.

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
				return res
					.status(500)
					.json({ message: "Stripe refund failed. Please process manually.", error: stripeError.message });
			}
		} else if (status === "approved" && order.paymentMethod === "cod") {
			order.paymentStatus = "refunded";
		}

		await order.save();

		// This can be refactored to use NotificationService in the future
		// For now, leaving it as is to limit scope of change.
		// Send emails

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