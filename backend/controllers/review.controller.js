import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import User from "../models/user.model.js";

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

// Helper function to get a fully populated review using an efficient, non-recursive method
const getPopulatedReviewById = async (reviewId) => {
	const review = await Review.findById(reviewId)
		.populate("user", "name profilePicture")
		.lean();

	if (!review) return null;

	const userIds = new Set();
	const collectUserIds = (replies) => {
		for (const reply of replies) {
			if (reply.user) userIds.add(reply.user.toString());
			if (reply.replies && reply.replies.length > 0) {
				collectUserIds(reply.replies);
			}
		}
	};
	if (review.replies) collectUserIds(review.replies);

	if (userIds.size > 0) {
		const users = await User.find({ _id: { $in: [...userIds] } })
			.select("name profilePicture")
			.lean();
		const userMap = new Map(users.map((user) => [user._id.toString(), user]));

		const populateUsers = (replies) => {
			for (const reply of replies) {
				if (reply.user) {
					reply.user = userMap.get(reply.user.toString());
				}
				if (reply.replies && reply.replies.length > 0) {
					populateUsers(reply.replies);
				}
			}
		};
		if (review.replies) populateUsers(review.replies);
	}

	return review;
};

export const createReview = async (req, res) => {
	const { productId } = req.params;
	const { rating, comment } = req.body;
	const actor = req.user;

	try {
		const product = await Product.findById(productId);

		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}

		const alreadyReviewed = await Review.findOne({ product: productId, user: actor._id });

		if (alreadyReviewed) {
			return res.status(400).json({ message: "You have already reviewed this product." });
		}

		const review = new Review({
			product: productId,
			user: actor._id,
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

		// Send notifications
		await NotificationService.createNotification("new_review", {
			actor,
			product,
			review,
		});

		res.status(201).json({ message: "Review added successfully" });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getAllReviews = async (req, res) => {
	try {
		const reviews = await Review.find({}).populate("user", "name").populate("product", "name");
		res.json(reviews);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

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
	const actor = req.user;

	try {
		const review = await Review.findById(reviewId).populate("user").populate("product");

		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		const isLiked = review.likes.includes(actor._id);

		if (isLiked) {
			review.likes.pull(actor._id);
		} else {
			review.likes.push(actor._id);
			// Send notification only when liking, not unliking
			await NotificationService.createNotification("new_like", {
				actor,
				recipient: review.user,
				review,
				product: review.product,
				likedEntityType: "review",
			});
		}

		await review.save();
		res.json({ message: "Review like status updated", likes: review.likes.length });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

import NotificationService from "../services/notification.service.js";

export const addReply = async (req, res) => {
	const { reviewId } = req.params;
	const { comment } = req.body;
	const actor = req.user;

	try {
		const review = await Review.findById(reviewId).populate("user").populate("product");

		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		const reply = { user: actor._id, comment, likes: [], replies: [] };
		review.replies.push(reply);
		await review.save();

		// Notify the original reviewer
		await NotificationService.createNotification("new_reply", {
			actor,
			recipient: review.user,
			review,
			product: review.product,
		});

		const populatedReview = await getPopulatedReviewById(reviewId);
		res.status(201).json(populatedReview);
	} catch (error) {
		console.error("Error in addReply:", error);
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
		const reviews = await Review.find({ product: productId })
			.populate("user", "name profilePicture")
			.lean();

		const getUserDetails = async (items) => {
			const userIds = new Set();
			const collectUserIds = (replies) => {
				for (const reply of replies) {
					if (reply.user) userIds.add(reply.user.toString());
					if (reply.replies && reply.replies.length > 0) {
						collectUserIds(reply.replies);
					}
				}
			};

			for (const review of items) {
				if (review.replies) collectUserIds(review.replies);
			}

			const users = await User.find({ _id: { $in: [...userIds] } })
				.select("name profilePicture")
				.lean();
			return new Map(users.map((user) => [user._id.toString(), user]));
		};

		const userMap = await getUserDetails(reviews);

		const populateUsers = (replies) => {
			for (const reply of replies) {
				if (reply.user) {
					reply.user = userMap.get(reply.user.toString());
				}
				if (reply.replies && reply.replies.length > 0) {
					populateUsers(reply.replies);
				}
			}
		};

		for (const review of reviews) {
			if (review.replies) {
				populateUsers(review.replies);
			}
		}

		res.json(reviews);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const replyToReply = async (req, res) => {
	const { reviewId, parentReplyId } = req.params;
	const { comment } = req.body;
	const actor = req.user;

	try {
		const review = await Review.findById(reviewId).populate("product");
		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		const parentReply = findReplyById(review.replies, parentReplyId);
		if (!parentReply) {
			return res.status(404).json({ message: "Parent reply not found" });
		}

		const newReply = { user: actor._id, comment, likes: [], replies: [] };
		parentReply.replies.push(newReply);
		await review.save();

		// Notify the author of the parent reply
		const recipient = await User.findById(parentReply.user);
		if (recipient) {
			await NotificationService.createNotification("new_reply", {
				actor,
				recipient,
				review,
				product: review.product,
			});
		}

		const populatedReview = await getPopulatedReviewById(reviewId);
		res.status(201).json(populatedReview);
	} catch (error) {
		console.error("Error in replyToReply:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const likeReply = async (req, res) => {
	const { reviewId, replyId } = req.params;
	const actor = req.user;

	try {
		const review = await Review.findById(reviewId).populate("product");
		if (!review) {
			return res.status(404).json({ message: "Review not found" });
		}

		const reply = findReplyById(review.replies, replyId);
		if (!reply) {
			return res.status(404).json({ message: "Reply not found" });
		}

		const isLiked = reply.likes.includes(actor._id);
		if (isLiked) {
			reply.likes.pull(actor._id);
		} else {
			reply.likes.push(actor._id);

			const recipient = await User.findById(reply.user);
			if (recipient) {
				await NotificationService.createNotification("new_like", {
					actor,
					recipient,
					review,
					product: review.product,
					likedEntityType: "reply",
				});
			}
		}

		await review.save();
		res.json({ message: "Reply like status updated", likes: reply.likes.length });
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};