import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createCodOrder } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/cod", protectRoute, createCodOrder);

export default router;
