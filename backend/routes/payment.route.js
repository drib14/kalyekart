import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { stripeWebhook } from "../controllers/payment.controller.js";

const router = express.Router();

// This is a placeholder for the Stripe webhook route.
// The actual implementation will be done in a separate task.
router.post("/stripe-webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default router;
