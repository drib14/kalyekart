import express from "express";
import {
	addToCart,
	getCartProducts,
	removeItemFromCart,
	updateQuantity,
	clearCart,
} from "../controllers/cart.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);
router.delete("/all/clear", protectRoute, clearCart);
router.delete("/:productId", protectRoute, removeItemFromCart);
router.put("/:productId", protectRoute, updateQuantity);

export default router;
