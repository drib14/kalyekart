import express from "express";
import { createCodOrder } from "../controllers/order.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/cod", auth, createCodOrder);

export default router;
