import express from "express";
import {
	createCodOrder,
	createStripeCheckoutSession,
	getOrders,
	getOrderById,
	updateOrderStatus,
	requestRefund,
	getRefunds,
	updateRefundStatus,
	cancelOrder,
} from "../controllers/order.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getOrders);
router.get("/:orderId", protectRoute, getOrderById);
router.post("/cod", protectRoute, createCodOrder);
router.post("/create-checkout-session", protectRoute, createStripeCheckoutSession);
router.put("/:orderId/status", protectRoute, adminRoute, updateOrderStatus);
router.post("/:orderId/refund", protectRoute, upload.single("proof"), requestRefund);
router.get("/refunds", protectRoute, adminRoute, getRefunds);
router.put("/refunds/:refundId/status", protectRoute, adminRoute, updateRefundStatus);
router.post("/cancel/:orderId", protectRoute, cancelOrder);

export default router;