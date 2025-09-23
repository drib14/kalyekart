import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { createReview, getReviewsForProduct, getAllReviews, deleteReview } from "../controllers/review.controller.js";

const router = express.Router();

// Get all reviews for a specific product
router.get("/product/:productId", getReviewsForProduct);

// Create a new review for a product
router.post("/product/:productId", protectRoute, createReview);

// Admin routes
router.get("/", protectRoute, adminRoute, getAllReviews);
router.delete("/:reviewId", protectRoute, adminRoute, deleteReview);

export default router;
