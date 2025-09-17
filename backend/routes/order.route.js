import express from "express";
import { createCodOrder } from "../controllers/order.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/cod", protectRoute, createCodOrder);

export default router;
