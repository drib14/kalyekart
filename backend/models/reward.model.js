import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		description: { type: String },
		cost: { type: Number, required: true }, // Points required
		type: {
			type: String,
			enum: ["discount_amount", "discount_percentage", "free_delivery"],
			required: true,
		},
		value: { type: Number, required: true }, // e.g., 50 (pesos), 10 (percent), 0 (if free delivery)
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

const Reward = mongoose.model("Reward", rewardSchema);

export default Reward;
