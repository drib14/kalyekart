import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Discount from "../models/discount.model.js";
import UserDiscount from "../models/userDiscount.model.js";
import { v4 as uuidv4 } from "uuid";
import { uploadOnCloudinary } from "../lib/cloudinary.js";
import { getCoordinates, calculateHaversineDistance } from "../services/location.service.js";
import NotificationService from "../services/notification.service.js";
import EmailService from "../services/email.service.js";

const WAREHOUSE_COORDINATES = { lat: 10.2983, lon: 123.8991 };

export const createCodOrder = async (req, res) => {
	try {
		const { products, shippingAddress, contactNumber, discountCode, subtotal } = req.body;
		const userId = req.user._id;
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		let discountAmount = 0;
		let discountId = null;

		if (discountCode) {
			const discount = await Discount.findOne({ code: discountCode });
			if (discount) {
				const userDiscount = await UserDiscount.findOne({ userId, discountId: discount._id });
				// All validation should be done on the apply discount route, but we do a final check here
				const isValid =
					discount.status === "active" &&
					new Date() >= discount.validFrom &&
					new Date() <= discount.validUntil &&
					subtotal >= discount.minimumOrderValue &&
					(!discount.usageLimit || discount.timesUsed < discount.usageLimit) &&
					(!userDiscount || userDiscount.timesUsed < discount.usageLimitPerUser);

				if (isValid) {
					if (discount.eligibility === "new") {
						const sevenDaysAgo = new Date();
						sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
						if (user.createdAt > sevenDaysAgo) {
							return res.status(400).json({ message: "This discount is for new users only" });
						}
					}

					discountId = discount._id;
					if (discount.type === "percentage") {
						discountAmount = (subtotal * discount.value) / 100;
					} else {
						discountAmount = discount.value;
					}
				}
			}
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

		if (discountId) {
			const discount = await Discount.findById(discountId);
			if (discount.type === "percentage") {
				discountAmount = ((subtotal + deliveryFee) * discount.value) / 100;
			} else if (discount.type === "delivery") {
				discountAmount = deliveryFee;
			}
		}

		const totalAmount = subtotal - discountAmount + deliveryFee;

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
			subtotal,
			deliveryFee,
			distance,
			discountAmount,
			discount: {
				discountId,
				code: discountCode,
			},
			totalAmount,
			paymongoSessionId: `cod_${uuidv4()}`,
		});

		await newOrder.save();

		if (discountId) {
			await Discount.updateOne({ _id: discountId }, { $inc: { timesUsed: 1 } });
			await UserDiscount.findOneAndUpdate(
				{ userId, discountId },
				{ $inc: { timesUsed: 1 } },
				{ upsert: true }
			);
		}

		user.cartItems = [];
		await user.save();

		await NotificationService.createNotification("new_order", {
			actor: user,
			order: newOrder,
			products: products,
		});

		await EmailService.sendOrderConfirmationEmail(user, newOrder, products);

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

		await EmailService.sendOrderStatusUpdateEmail(order.user, order);

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

		const admin = await User.findOne({ role: "admin" });
		if (admin) {
			// Create in-app notif
		}

		await EmailService.sendRefundRequestEmail(order.user, order);

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

		if (status === "approved" && order.paymentMethod === "cod") {
			order.paymentStatus = "refunded";
		} else if (status === "approved" && order.paymentMethod !== "cod") {
			console.warn(`Refund approved for non-COD order ${order._id}, but automated refund is not implemented.`);
			order.paymentStatus = "refunded";
		}

		await order.save();

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