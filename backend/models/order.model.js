import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		driver: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		driverLocationHistory: [
			{
				lat: Number,
				lng: Number,
				timestamp: { type: Date, default: Date.now },
			},
		],
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
				name: {
					type: String,
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
		discountAmount: {
			type: Number,
			default: 0,
		},
		discount: {
			discountId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "Discount",
			},
			code: String,
		},
		shippingAddress: {
			fullName: { type: String, required: true },
			sitio: { type: String }, // Optional field for more specific location
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
			enum: ["cod", "card", "gcash", "paymaya", "grab_pay"],
			default: "cod",
		},
		paymentStatus: {
			type: String,
			required: true,
			enum: ["pending", "paid", "failed", "refunded"],
			default: "pending",
		},
		status: {
			type: String,
			required: true,
			enum: ["Pending", "Preparing", "Ready", "Picked Up", "Out for Delivery", "Delivered", "Cancelled"],
			default: "Pending",
		},
		statusETA: {
			type: Date,
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
		paymongoSessionId: {
			type: String,
			unique: true,
			sparse: true, // This ensures that the unique index only applies to documents where this field exists
		},
	},
	{ timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;