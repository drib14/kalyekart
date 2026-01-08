import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, sendMessage } from "../controllers/chat.controller.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

router.get("/:orderId", protectRoute, getMessages);
router.post("/:orderId", protectRoute, upload.single("media"), sendMessage);

export default router;
