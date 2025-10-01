import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import Order from "../models/order.model.js";

export const createReview = async (req, res) => {
	const { productId } = req.params;
	const { rating, comment } = req.body;
	const userId = req.user._id;

	try {
		const product = await Product.findById(productId);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		// Check if the user has purchased the product
		const hasPurchased = await Order.findOne({
			user: userId,
			"products.product": productId,
			status: "Delivered",
		});

		if (!hasPurchased) {
			return res.status(403).json({ message: "You can only review products you have purchased." });
		}

		const alreadyReviewed = await Review.findOne({ product: productId, user: userId });

		if (alreadyReviewed) {
			return res.status(400).json({ message: "You have already reviewed this product." });
		}

		const review = new Review({
			product: productId,
			user: userId,
			rating,
			comment,
		});

		await review.save();

		// Update product with new review
		const reviews = await Review.find({ product: productId });
		product.numReviews = reviews.length;
		product.averageRating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;
		product.reviews.push(review._id);

		await product.save();

		res.status(201).json({ message: "Review added successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProductReviews = async (req, res) => {
	const { productId } = req.params;

	try {
		const reviews = await Review.find({ product: productId }).populate("user", "name profilePicture");
		res.json(reviews);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};