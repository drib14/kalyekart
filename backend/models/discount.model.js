import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			uppercase: true,
		},
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			trim: true,
		},
		type: {
			type: String,
			required: true,
			enum: ["percentage", "fixed"],
		},
		value: {
			type: Number,
			required: true,
			min: 0,
		},
		minimumOrderValue: {
			type: Number,
			default: 0,
		},
		validFrom: {
			type: Date,
			required: true,
		},
		validUntil: {
			type: Date,
			required: true,
		},
		usageLimit: {
			type: Number,
			default: null, // null for unlimited
		},
		timesUsed: {
			type: Number,
			default: 0,
		},
		status: {
			type: String,
			required: true,
			enum: ["active", "inactive", "expired"],
			default: "active",
		},
	},
	{
		timestamps: true,
	}
);

const Discount = mongoose.model("Discount", discountSchema);

export default Discount;