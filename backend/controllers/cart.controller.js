import User from "../models/user.model.js";

export const getCartProducts = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).populate("cartItems.product");
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in getCartProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const addToCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;

		const existingItem = user.cartItems.find((item) => item.product.toString() === productId);

		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			user.cartItems.push({ product: productId, quantity: 1 });
		}

		await user.save();
		const populatedUser = await User.findById(req.user._id).populate("cartItems.product");
		res.json(populatedUser.cartItems);
	} catch (error) {
		console.log("Error in addToCart controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const removeFromCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;

		if (!productId) {
			user.cartItems = [];
		} else {
			user.cartItems = user.cartItems.filter((item) => item.product.toString() !== productId);
		}
		await user.save();
		const populatedUser = await User.findById(req.user._id).populate("cartItems.product");
		res.json(populatedUser.cartItems);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateQuantity = async (req, res) => {
	try {
		const { productId } = req.params;
		const { quantity } = req.body;
		const user = req.user;
		const existingItem = user.cartItems.find((item) => item.product.toString() === productId);

		if (existingItem) {
			if (quantity === 0) {
				user.cartItems = user.cartItems.filter((item) => item.product.toString() !== productId);
			} else {
				existingItem.quantity = quantity;
			}
			await user.save();
			const populatedUser = await User.findById(req.user._id).populate("cartItems.product");
			res.json(populatedUser.cartItems);
		} else {
			res.status(404).json({ message: "Product not found in cart" });
		}
	} catch (error) {
		console.log("Error in updateQuantity controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
