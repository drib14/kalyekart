import express from "express";
import { createCheckoutSession, paymongoWebhook } from "../controllers/payment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/checkout", protectRoute, createCheckoutSession);

// Webhook from PayMongo, should not be protected
router.post("/paymongo-webhook", paymongoWebhook);

export default router;
