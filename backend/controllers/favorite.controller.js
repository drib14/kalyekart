import User from "../models/user.model.js";
import Product from "../models/product.model.js";

export const getFavorites = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).populate("favorites");
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.status(200).json(user.favorites);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const addFavorite = async (req, res) => {
	try {
		const { productId } = req.params;
		const userId = req.user._id;

		const product = await Product.findById(productId);
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		if (user.favorites.includes(productId)) {
			return res.status(400).json({ message: "Product already in favorites" });
		}

		user.favorites.push(productId);
		await user.save();

		res.status(200).json({ message: "Product added to favorites", favorites: user.favorites });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const removeFavorite = async (req, res) => {
	try {
		const { productId } = req.params;
		const userId = req.user._id;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.favorites.pull(productId);
		await user.save();

		res.status(200).json({ message: "Product removed from favorites", favorites: user.favorites });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};