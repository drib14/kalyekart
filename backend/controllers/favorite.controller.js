import User from "../models/user.model.js";
import mongoose from "mongoose";

export const toggleFavorite = async (req, res) => {
	const { productId } = req.params;
	const { _id: userId } = req.user;

	if (!mongoose.Types.ObjectId.isValid(productId)) {
		return res.status(400).json({ message: "Invalid Product ID" });
	}

	try {
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const isFavorited = user.favorites.includes(productId);
		const updateOperation = isFavorited
			? { $pull: { favorites: productId } }
			: { $addToSet: { favorites: productId } }; // Use $addToSet to prevent duplicates

		const updatedUser = await User.findByIdAndUpdate(userId, updateOperation, { new: true });

		res.status(200).json({
			message: `Product ${isFavorited ? "removed from" : "added to"} favorites.`,
			favorites: updatedUser.favorites,
		});
	} catch (error) {
		console.error("Error in toggleFavorite controller:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getFavoriteProducts = async (req, res) => {
	const { _id: userId } = req.user;

	try {
		const user = await User.findById(userId).populate({
			path: "favorites",
			populate: {
				path: "reviews", // Also populate reviews for rating display if needed
			},
		});

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json(user.favorites);
	} catch (error) {
		console.error("Error in getFavoriteProducts controller:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};