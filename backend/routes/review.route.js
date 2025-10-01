import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	createReview,
	getProductReviews,
	likeReview,
	addReply,
	getMyReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

router.get("/my-reviews", protectRoute, getMyReviews);
router.post("/:productId", protectRoute, createReview);
router.get("/:productId", getProductReviews);
router.post("/:reviewId/like", protectRoute, likeReview);
router.post("/:reviewId/reply", protectRoute, addReply);

export default router;