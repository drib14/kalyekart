import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { updateUserProfile } from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

router.put("/profile", protectRoute, upload.single("profilePicture"), updateUserProfile);

export default router;
