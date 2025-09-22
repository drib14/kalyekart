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
			fullName: { type: String, required: true },
			streetAddress: { type: String, required: true },
			city: { type: String, required: true },
			province: { type: String, required: true },
			postalCode: { type: String, required: true },
		},
		contactNumber: {
			type: String,
			required: true,
		},
		paymentMethod: {
			type: String,
			required: true,
			enum: ["cod", "card"],
			default: "cod",
		},
		paymentStatus: {
			type: String,
			required: true,
			enum: ["pending", "paid", "failed"],
			default: "pending",
		},
		status: {
			type: String,
			required: true,
			enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
			default: "pending",
		},
		cancellationReason: {
			type: String,
		},
		refundRequest: {
			reason: String,
			proof: String,
			status: {
				type: String,
				enum: ["pending", "approved", "rejected"],
			},
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
