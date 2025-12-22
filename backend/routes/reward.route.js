import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
	createReward,
	getAllRewards,
	updateReward,
	deleteReward,
	redeemReward,
	getUserPoints,
} from "../controllers/reward.controller.js";

const router = express.Router();

router.get("/", getAllRewards); // Public/Protected (filtered in controller)
router.get("/points", protectRoute, getUserPoints);
router.post("/redeem/:id", protectRoute, redeemReward);

// Admin routes
router.post("/", protectRoute, adminRoute, createReward);
router.put("/:id", protectRoute, adminRoute, updateReward);
router.delete("/:id", protectRoute, adminRoute, deleteReward);

export default router;
