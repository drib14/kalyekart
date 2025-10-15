import express from "express";
import { getFavorites, addFavorite, removeFavorite } from "../controllers/favorite.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getFavorites);
router.post("/:productId", protectRoute, addFavorite);
router.delete("/:productId", protectRoute, removeFavorite);

export default router;