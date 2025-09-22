import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { updateUserProfile } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.put("/profile", protect, upload.single("profilePicture"), updateUserProfile);

export default router;
