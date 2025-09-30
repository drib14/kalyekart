import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { streamAnalyticsData } from "../controllers/analytics.controller.js";

const router = express.Router();

// This single route will handle streaming all analytics data
router.get("/stream", protectRoute, adminRoute, streamAnalyticsData);

export default router;