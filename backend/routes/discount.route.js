import express from "express";
import {
	adminRoute,
	protectRoute,
} from "../middleware/auth.middleware.js";
import {
	createDiscount,
	getDiscounts,
	getDiscountById,
	updateDiscount,
	deleteDiscount,
	applyDiscount,
	getMyDiscounts,
} from "../controllers/discount.controller.js";

const router = express.Router();

// User-facing routes
router.post("/apply", protectRoute, applyDiscount);
router.get("/my-discounts", protectRoute, getMyDiscounts);

// Admin routes
router.post("/", protectRoute, adminRoute, createDiscount);
router.get("/", protectRoute, adminRoute, getDiscounts);
router.get("/:id", protectRoute, adminRoute, getDiscountById);
router.put("/:id", protectRoute, adminRoute, updateDiscount);
router.delete("/:id", protectRoute, adminRoute, deleteDiscount);

export default router;
