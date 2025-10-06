import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createPaymongoCheckoutSession, verifyPaymongoPayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-paymongo-checkout-session", protectRoute, createPaymongoCheckoutSession);
router.post("/verify-paymongo-payment", protectRoute, verifyPaymongoPayment);

export default router;