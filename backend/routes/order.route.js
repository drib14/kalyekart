import express from "express";
import {
	createCodOrder,
	getOrders,
	getOrderById,
	updateOrderStatus,
	updatePaymentStatus,
	requestRefund,
	getRefunds,
	updateRefundStatus,
	cancelOrder,
	getAllOrders,
	getAvailableOrders,
	getDriverOrders,
	acceptOrder,
	updateDriverLocation,
} from "../controllers/order.controller.js";
import { protectRoute, adminRoute, driverRoute } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getOrders);
router.get("/all", protectRoute, adminRoute, getAllOrders);
router.get("/available", protectRoute, driverRoute, getAvailableOrders);
router.get("/active", protectRoute, driverRoute, getDriverOrders);

router.get("/:orderId", protectRoute, getOrderById);
router.post("/cod", protectRoute, createCodOrder);

router.put("/:orderId/status", protectRoute, adminRoute, updateOrderStatus);
router.put("/:orderId/driver-status", protectRoute, driverRoute, updateOrderStatus); // Driver access to status update
router.put("/:orderId/accept", protectRoute, driverRoute, acceptOrder);
router.put("/:orderId/location", protectRoute, driverRoute, updateDriverLocation);

router.put("/:orderId/payment-status", protectRoute, adminRoute, updatePaymentStatus);
router.post("/:orderId/refund", protectRoute, upload.single("proof"), requestRefund);
router.get("/refunds", protectRoute, adminRoute, getRefunds);
router.put("/:orderId/refund/status", protectRoute, adminRoute, updateRefundStatus); // Corrected route
router.post("/cancel/:orderId", protectRoute, cancelOrder);

export default router;