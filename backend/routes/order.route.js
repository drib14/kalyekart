import express from "express";
import {
	createCodOrder,
	getOrders,
	cancelOrder,
	requestRefund,
	getAllOrders,
	updateOrderStatus,
	updateRefundStatus,
	getOrderById,
} from "../controllers/order.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getOrders);
router.get("/all", protectRoute, adminRoute, getAllOrders);
router.get("/:orderId", protectRoute, getOrderById);
router.post("/cod", protectRoute, createCodOrder);
router.put("/:orderId/cancel", protectRoute, cancelOrder);
router.post("/:orderId/refund", protectRoute, upload.single("proof"), requestRefund);
router.put("/:orderId/status", protectRoute, adminRoute, updateOrderStatus);
router.put("/:orderId/refund/status", protectRoute, adminRoute, updateRefundStatus);

export default router;
