import Product from "../models/product.model.js";
import Review from "../models/review.model.js";

export const createReview = async (req, res) => {
	const { productId } = req.params;
	const { rating, comment } = req.body;
	const userId = req.user._id;

	try {
		const product = await Product.findById(productId);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
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

// @desc    Get all reviews for admin
// @route   GET /api/reviews
// @access  Private/Admin
export const getAllReviews = async (req, res) => {
	try {
		const reviews = await Review.find({})
			.populate("user", "name")
			.populate("product", "name");
		res.json(reviews);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = async (req, res) => {
	const { reviewId } = req.params;

	try {
		const review = await Review.findById(reviewId);

		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		const productId = review.product;
		await review.deleteOne();

		// Recalculate product rating
		const product = await Product.findById(productId);
		if (product) {
			const reviews = await Review.find({ product: productId });
			product.numReviews = reviews.length;
			product.averageRating =
				reviews.length > 0
					? reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
					: 0;
			product.reviews = reviews.map((r) => r._id);
			await product.save();
		}

		res.json({ message: "Review removed" });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const likeReview = async (req, res) => {
	const { reviewId } = req.params;
	const userId = req.user._id;

	try {
		const review = await Review.findById(reviewId);

		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		const isLiked = review.likes.includes(userId);

		if (isLiked) {
			// Unlike the review
			review.likes.pull(userId);
		} else {
			// Like the review
			review.likes.push(userId);
		}

		await review.save();
		res.json({ message: "Review like status updated", likes: review.likes.length });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const addReply = async (req, res) => {
	const { reviewId } = req.params;
	const { comment } = req.body;
	const userId = req.user._id;

	try {
		const review = await Review.findById(reviewId);

		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		const reply = {
			user: userId,
			comment,
		};

		review.replies.push(reply);
		await review.save();

		const populatedReview = await Review.findById(reviewId).populate("replies.user", "name profilePicture");

		res.status(201).json(populatedReview);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getMyReviews = async (req, res) => {
	const userId = req.user._id;

	try {
		const reviews = await Review.find({ user: userId }).populate("product", "name image");
		res.json(reviews);
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