import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		comment: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{ timestamps: true }
);

const reviewSchema = new mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "Product",
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			ref: "User",
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		comment: {
			type: String,
			required: true,
			trim: true,
		},
		likes: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
			},
		],
		replies: [replySchema],
	},
	{
		timestamps: true,
	}
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;