import express from "express";
import {
	createProduct,
	deleteProduct,
	getAllProducts,
	getFeaturedProducts,
	getMostReviewedProducts,
	getProductsByCategory,
	getRecommendedProducts,
	getProductById,
	searchProducts,
	toggleFeaturedProduct,
	updateProduct,
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/featured", getFeaturedProducts);
router.get("/most-reviewed", getMostReviewedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.get("/:id", getProductById); // Must be after other specific GET routes
router.post("/", protectRoute, adminRoute, createProduct);
router.put("/:id", protectRoute, adminRoute, updateProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;
