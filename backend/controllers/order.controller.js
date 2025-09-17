import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import { sendOrderConfirmationEmail } from "../lib/email.js";

export const createCodOrder = async (req, res) => {
	try {
		const { products, shippingAddress, phoneNumber } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let totalAmount = 0;
		const orderProducts = products.map((product) => {
			totalAmount += product.price * product.quantity;
			return {
				product: product._id,
				quantity: product.quantity,
				price: product.price,
			};
		});

		const newOrder = new Order({
			user: req.user._id,
			products: orderProducts,
			totalAmount,
			shippingAddress,
			phoneNumber,
			paymentMethod: "COD",
			status: "Pending",
		});

		await newOrder.save();

		// Populate product details for the email
		const populatedOrder = await Order.findById(newOrder._id).populate("products.product");

		// Send order confirmation email
		await sendOrderConfirmationEmail(req.user.email, populatedOrder);

		// Optionally, update user's address and phone number
		await User.findByIdAndUpdate(req.user._id, {
			address: shippingAddress,
			phoneNumber,
		});

		res.status(201).json({
			success: true,
			message: "Order placed successfully.",
			orderId: newOrder._id,
		});
	} catch (error) {
		console.error("Error creating COD order:", error);
		res.status(500).json({ message: "Error creating COD order", error: error.message });
	}
};
