import Order from "../models/order.model.js";
import Coupon from "../models/coupon.model.js";
import { uploadOnCloudinary } from "../lib/cloudinary.js";

export const getOrders = async (req, res) => {
	try {
		const userId = req.user._id;
		const orders = await Order.find({ user: userId })
			.sort({ createdAt: -1 })
			.populate({
				path: "products",
				populate: {
				path: "product",
				model: "Product",
			},
		});
		res.status(200).json(orders);
	} catch (error) {
		console.error("Error getting orders:", error);
		res.status(500).json({ message: "Error getting orders", error: error.message });
	}
};

export const createCodOrder = async (req, res) => {
	try {
		const { products, couponCode, shippingAddress, contactNumber, subtotal, deliveryFee, distance, totalAmount } =
			req.body;
		const userId = req.user._id;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let couponDetails = null;
		if (couponCode) {
			const coupon = await Coupon.findOne({ code: couponCode, userId, isActive: true });
			if (coupon) {
				await Coupon.findOneAndUpdate({ code: couponCode, userId }, { isActive: false });
				couponDetails = {
					code: coupon.code,
					discountPercentage: coupon.discountPercentage,
				};
			}
		}

		const newOrder = new Order({
			user: userId,
			products: products.map((p) => ({
				product: p._id,
				quantity: p.quantity,
				price: p.price,
			})),
			subtotal,
			deliveryFee: Math.round(deliveryFee),
			distance,
			totalAmount,
			coupon: couponDetails,
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

export const cancelOrder = async (req, res) => {
	try {
		const { orderId } = req.params;
		const { reason } = req.body;
		const userId = req.user._id;

		const order = await Order.findOne({ _id: orderId, user: userId });

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		if (order.status !== "pending") {
			return res.status(400).json({ message: "Only pending orders can be cancelled" });
		}

		order.status = "cancelled";
		order.cancellationReason = reason;
		await order.save();

		res.status(200).json({ message: "Order cancelled successfully" });
	} catch (error) {
		console.error("Error cancelling order:", error);
		res.status(500).json({ message: "Error cancelling order", error: error.message });
	}
};

export const requestRefund = async (req, res) => {
	try {
		const { orderId } = req.params;
		const { reason } = req.body;
		const userId = req.user._id;
		const proofPath = req.file?.path;

		if (!proofPath) {
			return res.status(400).json({ message: "Proof is required" });
		}

		const order = await Order.findOne({ _id: orderId, user: userId });

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		if (order.status !== "delivered") {
			return res.status(400).json({ message: "Only delivered orders can be refunded" });
		}

		const proof = await uploadOnCloudinary(proofPath);

		if (!proof) {
			return res.status(500).json({ message: "Error uploading proof" });
		}

		order.refundRequest = {
			reason,
			proof: proof.url,
			status: "pending",
		};
		await order.save();

		res.status(200).json({ message: "Refund request submitted successfully" });
	} catch (error) {
		console.error("Error requesting refund:", error);
		res.status(500).json({ message: "Error requesting refund", error: error.message });
	}
};

export const getAllOrders = async (req, res) => {
	try {
		const orders = await Order.find()
			.populate("user", "name email profilePicture")
			.populate({
				path: "products",
				populate: {
					path: "product",
					model: "Product",
				},
			});
		res.status(200).json(orders);
	} catch (error) {
		console.error("Error getting all orders:", error);
		res.status(500).json({ message: "Error getting all orders", error: error.message });
	}
};

export const updateOrderStatus = async (req, res) => {
	try {
		const { orderId } = req.params;
		const { status } = req.body;

		const order = await Order.findById(orderId);

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		order.status = status;
		await order.save();

		res.status(200).json({ message: "Order status updated successfully" });
	} catch (error) {
		console.error("Error updating order status:", error);
		res.status(500).json({ message: "Error updating order status", error: error.message });
	}
};

export const updateRefundStatus = async (req, res) => {
	try {
		const { orderId } = req.params;
		const { status, rejectionReason } = req.body;

		const order = await Order.findById(orderId);

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		if (!order.refundRequest) {
			return res.status(404).json({ message: "Refund request not found" });
		}

		order.refundRequest.status = status;
		if (status === "rejected" && rejectionReason) {
			order.refundRequest.rejectionReason = rejectionReason;
		}
		await order.save();

		res.status(200).json({ message: "Refund status updated successfully" });
	} catch (error) {
		console.error("Error updating refund status:", error);
		res.status(500).json({ message: "Error updating refund status", error: error.message });
	}
};

export const getOrderById = async (req, res) => {
	try {
		const { orderId } = req.params;
		const userId = req.user._id;
		const userRole = req.user.role;

		const order = await Order.findById(orderId)
			.populate("user", "name email")
			.populate({
				path: "products.product",
				model: "Product",
			});

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		// Check if the user is the owner of the order or an admin
		if (order.user._id.toString() !== userId.toString() && userRole !== "admin") {
			return res.status(403).json({ message: "Not authorized to view this order" });
		}

		res.status(200).json(order);
	} catch (error) {
		console.error("Error getting order by ID:", error);
		res.status(500).json({ message: "Error getting order by ID", error: error.message });
	}
};
