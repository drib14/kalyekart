import User from "../models/user.model.js";
import Product from "../models/product.model.js";

export const toggleFavorite = async (req, res) => {
	const { productId } = req.params;
	const userId = req.user._id;

	try {
		const product = await Product.findById(productId);
		const user = await User.findById(userId);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		const isFavorited = user.favorites.includes(productId);

		if (isFavorited) {
			// Remove from favorites
			user.favorites.pull(productId);
			product.favoritedBy.pull(userId);
		} else {
			// Add to favorites
			user.favorites.push(productId);
			product.favoritedBy.push(userId);
		}

		await user.save();
		await product.save();

		res.status(200).json({
			message: "Favorite status updated",
			favorites: user.favorites,
		});
	} catch (error) {
		console.error("Error in toggleFavorite controller:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getFavoriteProducts = async (req, res) => {
	const userId = req.user._id;

	try {
		const user = await User.findById(userId).populate({
			path: "favorites",
			model: "Product",
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