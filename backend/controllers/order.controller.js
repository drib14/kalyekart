import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import { stripe } from "../lib/stripe.js";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "../lib/cloudinary.js";

import { getCoordinates, calculateHaversineDistance } from "../services/location.service.js";
import { sendEmail } from "../lib/email.js";

const WAREHOUSE_COORDINATES = { lat: 10.2983, lon: 123.8991 }; // USC Main Campus (for Pungko-pungko sa salazar)

export const createCodOrder = async (req, res) => {
	try {
		const {
			products,
			shippingAddress,
			contactNumber,
			couponCode,
			subtotal,
		} = req.body;

		// Calculate delivery fee on the server
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

		// Send order confirmation email
		const orderItemsHtml = newOrder.products
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
			`Your Kalyekart Order #${newOrder._id} is Confirmed!`,
			"orderConfirmation",
			{
				USER_NAME: user.name,
				ORDER_ID: newOrder._id,
				ORDER_ITEMS: orderItemsHtml,
				SUBTOTAL: `₱${newOrder.subtotal.toFixed(2)}`,
				DELIVERY_FEE: `₱${newOrder.deliveryFee.toFixed(2)}`,
				TOTAL_AMOUNT: `₱${newOrder.totalAmount.toFixed(2)}`,
				CLIENT_URL: process.env.CLIENT_URL,
			}
		);

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

		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		// Optional: Check if the user is authorized to cancel the order
		if (order.user.toString() !== req.user._id.toString()) {
			return res.status(401).json({ message: "Not authorized to cancel this order" });
		}

		order.status = "Cancelled";
		order.cancellationReason = cancellationReason || "Order cancelled by user.";
		await order.save();
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
			.populate("user", "name email"); // Populate user details

		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		// Ensure the user owns the order OR is an admin
		if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
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

		// Calculate delivery fee on the server
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
		const orders = await Order.find({ user: req.user._id })
			.populate({
				path: "products.product",
				select: "name image", // Explicitly select the fields needed for the frontend
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
		const { status, paymentStatus, refundStatus, rejectionReason } = req.body;

		const order = await Order.findById(orderId).populate("user", "name email");
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		// Handle various status updates
		if (status) {
			order.status = status;
		}
		if (paymentStatus) {
			order.paymentStatus = paymentStatus;
		}
		if (refundStatus) {
			if (!order.refundRequest) {
				return res.status(400).json({ message: "No refund request found for this order." });
			}
			order.refundRequest.status = refundStatus;
			if (rejectionReason) {
				order.refundRequest.rejectionReason = rejectionReason;
			}
		}

		await order.save();

		// If the main order status changed, send an email notification.
		if (status) {
			// --- Send Order Update Email ---
			const statusMessages = {
				Processing: "Your order is being processed and prepared for shipment.",
				Shipped: "Your order has been shipped and is on its way to you.",
				"Out for Delivery": "Your order is out for delivery and should arrive soon.",
				Delivered: "Your order has been delivered. Thank you for shopping with us!",
				Cancelled: "Your order has been cancelled.",
			};

			await sendEmail(
				order.user.email,
				`Your Kalyekart Order Status is now: ${status}`,
				"orderUpdate",
				{
					USER_NAME: order.user.name,
					ORDER_ID: order._id,
					ORDER_STATUS: status,
					STATUS_MESSAGE: statusMessages[status] || "Your order status has been updated.",
					CLIENT_URL: process.env.CLIENT_URL,
				}
			);

			// --- Send Virtual Receipt on Delivery ---
			if (status === "Delivered") {
				const orderItemsHtml = order.products
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
					order.user.email,
					`Your Receipt for Kalyekart Order #${order._id}`,
					"virtualReceipt",
					{
						USER_NAME: order.user.name,
						ORDER_ID: order._id,
						ORDER_ITEMS: orderItemsHtml,
						SUBTOTAL: `₱${order.subtotal.toFixed(2)}`,
						DELIVERY_FEE: `₱${order.deliveryFee.toFixed(2)}`,
						TOTAL_AMOUNT: `₱${order.totalAmount.toFixed(2)}`,
						PAYMENT_METHOD: order.paymentMethod.toUpperCase(),
						TRANSACTION_ID: order.stripeSessionId || order._id, // Use stripeSessionId if available
						DATE: new Date(order.createdAt).toLocaleDateString("en-US", {
							year: "numeric",
							month: "long",
							day: "numeric",
						}),
						ADMIN_NAME: req.user.name, // The admin who marked the order as delivered
					}
				);
			}
		}

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

		const order = await Order.findById(orderId);
		if (!order) {
			return res.status(404).json({ message: "Order not found" });
		}

		// Convert buffer to data URI
		const b64 = Buffer.from(req.file.buffer).toString("base64");
		let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

		const result = await cloudinary.uploader.upload(dataURI, {
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