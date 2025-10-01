import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	toggleFavorite,
	getFavoriteProducts,
} from "../controllers/favorite.controller.js";

const router = express.Router();

router.get("/", protectRoute, getFavoriteProducts);
router.post("/toggle/:productId", protectRoute, toggleFavorite);

export default router;