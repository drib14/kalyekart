import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	updateUserProfile,
	getDeliveryAddresses,
	addDeliveryAddress,
	updateDeliveryAddress,
	deleteDeliveryAddress,
	setDefaultDeliveryAddress,
} from "../controllers/user.controller.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

router.put("/profile", protectRoute, upload.single("profilePicture"), updateUserProfile);

// Routes for managing delivery addresses
router.get("/addresses", protectRoute, getDeliveryAddresses);
router.post("/addresses", protectRoute, addDeliveryAddress);
router.put("/addresses/:addressId", protectRoute, updateDeliveryAddress);
router.delete("/addresses/:addressId", protectRoute, deleteDeliveryAddress);
router.patch("/addresses/:addressId/set-default", protectRoute, setDefaultDeliveryAddress);


export default router;
