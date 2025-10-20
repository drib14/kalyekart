import mongoose from "mongoose";

const userDiscountSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		discountId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Discount",
			required: true,
		},
		timesUsed: {
			type: Number,
			default: 1,
		},
	},
	{
		timestamps: true,
	}
);

// To ensure a user can only have one entry per discount
userDiscountSchema.index({ userId: 1, discountId: 1 }, { unique: true });

const UserDiscount = mongoose.model("UserDiscount", userDiscountSchema);

export default UserDiscount;
