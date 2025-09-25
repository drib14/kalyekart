import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { stripe } from "../lib/stripe.js";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "../lib/cloudinary.js";

export const createCodOrder = async (req, res) => {
	try {
		const {
			products,
			shippingAddress,
			contactNumber,
			couponCode,
			subtotal,
			deliveryFee,
			distance,
			totalAmount,
		} = req.body;

		const newOrder = new Order({
			user: req.user._id,
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
		const user = await User.findById(req.user._id);
		user.cartItems = [];
		await user.save();

		res.status(201).json({ message: "Order created successfully", orderId: newOrder._id });
	} catch (error) {
		console.log("Error in createCodOrder controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const createStripeCheckoutSession = async (req, res) => {
	try {
		const { products, shippingAddress, contactNumber, couponCode, subtotal, deliveryFee, distance, totalAmount } =
			req.body;
		const idempotencyKey = uuidv4();

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

		const session = await stripe.checkout.sessions.create(
			{
				payment_method_types: ["card"],
				line_items,
				mode: "payment",
				success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
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
		const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
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

		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		order.status = status;
		await order.save();
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
		const proof = req.file;

		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		const result = await cloudinary.uploader.upload(proof.path, {
			folder: "refunds",
		});

		order.refundRequest = {
			reason,
			proof: result.secure_url,
			status: "pending",
		};
		await order.save();
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
		const { refundId } = req.params;
		const { status } = req.body;

		const order = await Order.findOne({ "refundRequest._id": refundId });
		if (!order) {
			return res.status(404).json({ message: "Refund request not found" });
		}

		order.refundRequest.status = status;
		await order.save();
		res.json(order);
	} catch (error) {
		console.log("Error in updateRefundStatus controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};