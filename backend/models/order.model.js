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
		subtotal: {
			type: Number,
			required: true,
			default: 0,
		},
		distance: {
			type: Number,
			required: true,
		},
		deliveryFee: {
			type: Number,
			required: true,
			default: 0,
		},
		totalAmount: {
			type: Number,
			required: true,
			min: 0,
		},
		coupon: {
			code: String,
			discountPercentage: Number,
		},
		shippingAddress: {
			fullName: { type: String, required: true },
			streetAddress: { type: String, required: true },
			city: { type: String, required: true },
			barangay: { type: String, required: true },
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
			enum: ["Pending", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
			default: "Pending",
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
			rejectionReason: String,
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
