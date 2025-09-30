import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";
import { getRevenueAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getRevenueAnalytics);

export default router;