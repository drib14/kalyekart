import express from "express";
import {
	login,
	logout,
	signup,
	refreshToken,
	getProfile,
	setSecurityQuestions,
	getSecurityQuestions,
	verifySecurityAnswers,
	resetPasswordWithToken,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.post("/set-security-questions", protectRoute, setSecurityQuestions);
router.get("/get-security-questions/:email", getSecurityQuestions);
router.post("/verify-security-answers", verifySecurityAnswers);
router.post("/reset-password-with-token", resetPasswordWithToken);

export default router;
