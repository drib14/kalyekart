import User from "../models/user.model.js";

// Helper to filter out invalid cart items
const cleanCart = (user) => {
	const originalLength = user.cartItems.length;
	user.cartItems = user.cartItems.filter((item) => item.product);
	return originalLength !== user.cartItems.length;
};

export const getCartProducts = async (req, res) => {
	try {
		const user = req.user;
		const wasCleaned = cleanCart(user);
		if (wasCleaned) {
			await user.save();
		}

		await user.populate("cartItems.product");
		// After populating, filter out items where product is null (e.g., product was deleted)
		const validCartItems = user.cartItems.filter((item) => item.product);

		res.json(validCartItems);
	} catch (error) {
		console.log("Error in getCartProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const addToCart = async (req, res) => {
	try {
		const { productId } = req.body;
		if (!productId) {
			return res.status(400).json({ message: "Product ID is required" });
		}

		const user = req.user;
		cleanCart(user); // Clean before processing

		const existingItem = user.cartItems.find((item) => item.product.toString() === productId);

		if (existingItem) {
			existingItem.quantity += 1;
		} else {
			user.cartItems.push({ product: productId, quantity: 1 });
		}

		await user.save();
		await user.populate("cartItems.product");
		res.json(user.cartItems);
	} catch (error) {
		console.log("Error in addToCart controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const removeFromCart = async (req, res) => {
	try {
		const { productId } = req.body;
		const user = req.user;
		cleanCart(user);

		if (!productId) {
			user.cartItems = [];
		} else {
			user.cartItems = user.cartItems.filter((item) => item.product.toString() !== productId);
		}
		await user.save();
		await user.populate("cartItems.product");
		res.json(user.cartItems);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateQuantity = async (req, res) => {
	try {
		const { productId } = req.params;
		const { quantity } = req.body;
		const user = req.user;
		cleanCart(user);
		const existingItem = user.cartItems.find((item) => item.product.toString() === productId);

		if (existingItem) {
			if (quantity === 0) {
				user.cartItems = user.cartItems.filter((item) => item.product.toString() !== productId);
			} else {
				existingItem.quantity = quantity;
			}
			await user.save();
			await user.populate("cartItems.product");
			res.json(user.cartItems);
		} else {
			res.status(404).json({ message: "Product not found in cart" });
		}
	} catch (error) {
		console.log("Error in updateQuantity controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
