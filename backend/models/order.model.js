import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		products: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Product",
					required: true,
				},
				quantity: {
					type: Number,
					required: true,
					min: 1,
				},
				price: {
					type: Number,
					required: true,
					min: 0,
				},
			},
		],
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		shippingAddress: {
			street: { type: String, required: true },
			city: { type: String, required: true },
			province: { type: String, required: true },
			zipCode: { type: String, required: true },
			barangay: { type: String, required: true },
		},
		phoneNumber: {
			type: String,
			required: true,
		},
		paymentMethod: {
			type: String,
			required: true,
			enum: ["COD", "Stripe", "PayMongo"],
		},
		status: {
			type: String,
			required: true,
			enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
			default: "Pending",
		},
		stripeSessionId: {
			type: String,
			unique: true,
			sparse: true,
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
