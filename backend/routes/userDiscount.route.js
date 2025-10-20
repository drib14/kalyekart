import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	applyDiscount,
	getMyDiscounts,
} from "../controllers/discount.controller.js";

const router = express.Router();

router.post("/apply", protectRoute, applyDiscount);
router.get("/my-discounts", protectRoute, getMyDiscounts);

export default router;
