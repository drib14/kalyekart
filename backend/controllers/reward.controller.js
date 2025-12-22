import Reward from "../models/reward.model.js";
import User from "../models/user.model.js";
import Discount from "../models/discount.model.js";
import Settings from "../models/settings.model.js";
import crypto from "crypto";

export const createReward = async (req, res) => {
	try {
		const { name, description, cost, type, value, isActive } = req.body;
		const reward = await Reward.create({ name, description, cost, type, value, isActive });
		res.status(201).json(reward);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getAllRewards = async (req, res) => {
	try {
		// Admin gets all, users get active only (handled via separate route or param, but for simplicity here admin access checks in route)
		const filter = req.user && req.user.role === "admin" ? {} : { isActive: true };
		const rewards = await Reward.find(filter).sort({ cost: 1 });
		res.json(rewards);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateReward = async (req, res) => {
	try {
		const { id } = req.params;
		const reward = await Reward.findByIdAndUpdate(id, req.body, { new: true });
		if (!reward) return res.status(404).json({ message: "Reward not found" });
		res.json(reward);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const deleteReward = async (req, res) => {
	try {
		const { id } = req.params;
		await Reward.findByIdAndDelete(id);
		res.json({ message: "Reward deleted successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const redeemReward = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findById(req.user._id);
		const reward = await Reward.findById(id);

		if (!reward) return res.status(404).json({ message: "Reward not found" });
		if (!reward.isActive) return res.status(400).json({ message: "Reward is no longer active" });
		if (user.loyaltyPoints < reward.cost) return res.status(400).json({ message: "Insufficient points" });

		// Generate a discount code
		const code = `REW-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
		let discountType = "fixed";
		if (reward.type === "discount_percentage") discountType = "percentage";
		if (reward.type === "free_delivery") discountType = "delivery";

		// Create a discount (one-time use)
		const discount = await Discount.create({
			code,
			value: reward.value,
			type: discountType,
			validFrom: new Date(),
			validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days validity
			usageLimit: 1,
			usageLimitPerUser: 1,
			isActive: true,
			eligibility: "all",
		});

		// Deduct points
		user.loyaltyPoints -= reward.cost;
		user.pointsHistory.push({
			type: "redeemed",
			amount: reward.cost,
			description: `Redeemed ${reward.name}`,
			rewardId: reward._id,
		});
		await user.save();

		res.json({ message: "Reward redeemed successfully", code, discount });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getUserPoints = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("loyaltyPoints pointsHistory");
		res.json(user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
