import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";

const router = express.Router();

router.get("/", getSettings);
router.put("/", protectRoute, adminRoute, updateSettings);

export default router;
