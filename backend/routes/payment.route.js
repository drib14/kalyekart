import express from "express";
import { createPayment, verifyPayment } from "../controllers/payment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-payment", protectRoute, createPayment);
router.post("/verify-payment", protectRoute, verifyPayment);

export default router;
