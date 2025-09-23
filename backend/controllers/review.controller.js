import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";

// Helper function to update product's average rating
const updateProductRating = async (productId) => {
	try {
		const reviews = await Review.find({ product: productId });
		if (reviews.length === 0) {
			await Product.findByIdAndUpdate(productId, {
				averageRating: 0,
				numReviews: 0,
			});
			return;
		}

		const totalRating = reviews.reduce((acc, item) => item.rating + acc, 0);
		const averageRating = totalRating / reviews.length;
		const numReviews = reviews.length;

		await Product.findByIdAndUpdate(productId, {
			averageRating: averageRating.toFixed(1),
			numReviews,
		});
	} catch (error) {
		console.error("Error updating product rating:", error);
	}
};

export const createReview = async (req, res) => {
	try {
		const { productId } = req.params;
		const { rating, comment } = req.body;
		const userId = req.user._id;

		// 1. Check if the user has purchased the product
		const hasPurchased = await Order.exists({
			user: userId,
			"products.product": productId,
			status: "Delivered",
		});

		if (!hasPurchased) {
			return res.status(403).json({ message: "You can only review products you have purchased and received." });
		}

		// 2. Check if the user has already reviewed the product
		const existingReview = await Review.findOne({ product: productId, user: userId });
		if (existingReview) {
			return res.status(400).json({ message: "You have already reviewed this product." });
		}

		// 3. Create the review
		const review = await Review.create({
			product: productId,
			user: userId,
			rating,
			comment,
		});

		// 4. Update the product's average rating
		await updateProductRating(productId);

		res.status(201).json(review);
	} catch (error) {
		console.error("Error creating review:", error);
		res.status(500).json({ message: "Server error while creating review." });
	}
};

export const getReviewsForProduct = async (req, res) => {
	try {
		const { productId } = req.params;
		const reviews = await Review.find({ product: productId }).populate("user", "name profilePicture");
		res.status(200).json(reviews);
	} catch (error) {
		console.error("Error fetching reviews:", error);
		res.status(500).json({ message: "Server error while fetching reviews." });
	}
};

export const getAllReviews = async (req, res) => {
	try {
		const reviews = await Review.find({}).populate("user", "name").populate("product", "name");
		res.status(200).json(reviews);
	} catch (error) {
		console.error("Error fetching all reviews:", error);
		res.status(500).json({ message: "Server error while fetching all reviews." });
	}
};

export const deleteReview = async (req, res) => {
	try {
		const { reviewId } = req.params;
		const review = await Review.findById(reviewId);

		if (!review) {
			return res.status(404).json({ message: "Review not found." });
		}

		const productId = review.product;
		await Review.findByIdAndDelete(reviewId);

		// Update the product's average rating after deleting the review
		await updateProductRating(productId);

		res.status(200).json({ message: "Review deleted successfully." });
	} catch (error) {
		console.error("Error deleting review:", error);
		res.status(500).json({ message: "Server error while deleting review." });
	}
};
