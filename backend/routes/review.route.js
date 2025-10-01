import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
	createReview,
	getProductReviews,
	likeReview,
	addReply,
	getMyReviews,
	getAllReviews,
	deleteReview,
} from "../controllers/review.controller.js";

const router = express.Router();

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Private/Admin
router.get("/", protectRoute, adminRoute, getAllReviews);

// @desc    Get a user's own reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
router.get("/my-reviews", protectRoute, getMyReviews);

// @desc    Create a new review
// @route   POST /api/reviews/:productId
// @access  Private
router.post("/:productId", protectRoute, createReview);

// @desc    Get all reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
router.get("/:productId", getProductReviews);

// @desc    Like/unlike a review
// @route   POST /api/reviews/:reviewId/like
// @access  Private
router.post("/:reviewId/like", protectRoute, likeReview);

// @desc    Reply to a review
// @route   POST /api/reviews/:reviewId/reply
// @access  Private
router.post("/:reviewId/reply", protectRoute, addReply);

// @desc    Delete a review
// @route   DELETE /api/reviews/:reviewId
// @access  Private/Admin
router.delete("/:reviewId", protectRoute, adminRoute, deleteReview);

export default router;