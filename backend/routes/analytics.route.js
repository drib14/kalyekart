import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { streamAnalyticsData, getQuickStats } from "../controllers/analytics.controller.js";

const router = express.Router();

// This single route will handle streaming all analytics data
router.get("/stream", protectRoute, adminRoute, streamAnalyticsData);
router.get("/quick-stats", protectRoute, adminRoute, getQuickStats);

export default router;