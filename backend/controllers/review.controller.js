import Product from "../models/product.model.js";
import Review from "../models/review.model.js";

// Helper function to recursively populate replies
async function populateReplies(replies) {
	if (!replies || replies.length === 0) return;

	for (const reply of replies) {
		// Mongoose sub-docs need to be populated this way
		await reply.populate({ path: "user", select: "name profilePicture" });
		await populateReplies(reply.replies);
	}
}

// Helper function to find a reply by its ID within a review document
const findReplyById = (replies, replyId) => {
	for (const reply of replies) {
		if (reply._id.toString() === replyId) {
			return reply;
		}
		if (reply.replies && reply.replies.length > 0) {
			const found = findReplyById(reply.replies, replyId);
			if (found) return found;
		}
	}
	return null;
};

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

		const populatedReview = await Review.findById(reviewId).populate("user", "name profilePicture");
		await populateReplies(populatedReview.replies);

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
		const reviews = await Review.find({ product: productId }).populate(
			"user",
			"name profilePicture"
		);

		for (const review of reviews) {
			await populateReplies(review.replies);
		}

		res.json(reviews);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const replyToReply = async (req, res) => {
	const { reviewId, parentReplyId } = req.params;
	const { comment } = req.body;
	const userId = req.user._id;

	try {
		const review = await Review.findById(reviewId);
		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		const parentReply = findReplyById(review.replies, parentReplyId);
		if (!parentReply) {
			return res.status(404).json({ message: "Parent reply not found" });
		}

		const newReply = {
			user: userId,
			comment,
			likes: [],
			replies: [],
		};

		parentReply.replies.push(newReply);
		await review.save();

		const populatedReview = await Review.findById(reviewId).populate("user", "name profilePicture");
		await populateReplies(populatedReview.replies);

		res.status(201).json(populatedReview);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const likeReply = async (req, res) => {
	const { reviewId, replyId } = req.params;
	const userId = req.user._id;

	try {
		const review = await Review.findById(reviewId);
		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		const reply = findReplyById(review.replies, replyId);
		if (!reply) {
			return res.status(404).json({ message: "Reply not found" });
		}

		const isLiked = reply.likes.includes(userId);
		if (isLiked) {
			reply.likes.pull(userId);
		} else {
			reply.likes.push(userId);
		}

		await review.save();
		res.json({ message: "Reply like status updated", likes: reply.likes.length });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};