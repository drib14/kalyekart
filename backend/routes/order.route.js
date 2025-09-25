import express from "express";
import {
	createCodOrder,
	createStripeCheckoutSession,
	getOrders,
	getOrderById,
	updateOrderStatus,
	requestRefund,
	getRefunds,
	cancelOrder,
	getAllOrders,
} from "../controllers/order.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getOrders);
router.get("/all", protectRoute, adminRoute, getAllOrders); // Must be before /:orderId
router.get("/:orderId", protectRoute, getOrderById);
router.post("/cod", protectRoute, createCodOrder);
router.post("/create-checkout-session", protectRoute, createStripeCheckoutSession);
router.put("/:orderId/status", protectRoute, adminRoute, updateOrderStatus);
router.post("/:orderId/refund", protectRoute, upload.single("proof"), requestRefund);
router.get("/refunds", protectRoute, adminRoute, getRefunds);
router.post("/cancel/:orderId", protectRoute, cancelOrder);

export default router;