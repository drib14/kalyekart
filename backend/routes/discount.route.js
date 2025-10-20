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
} from "../controllers/discount.controller.js";

const router = express.Router();

// Admin routes
router.post("/", protectRoute, adminRoute, createDiscount);
router.get("/", protectRoute, adminRoute, getDiscounts);
router.get("/:id", protectRoute, adminRoute, getDiscountById);
router.put("/:id", protectRoute, adminRoute, updateDiscount);
router.delete("/:id", protectRoute, adminRoute, deleteDiscount);

export default router;
