import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../lib/cloudinary.js";
import { prepareUserResponse } from "../lib/prepareUserResponse.js";

export const updateUserProfile = async (req, res) => {
	try {
		const { name, email, phoneNumber, storeName, storeAddress, operatingHours } = req.body;
		const userId = req.user._id;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Update common fields
		user.name = name || user.name;
		user.email = email || user.email;
		user.phoneNumber = phoneNumber || user.phoneNumber;

		// Update admin-specific fields only if the user is an admin
		if (user.role === "admin") {
			user.storeName = storeName || user.storeName;
			user.storeAddress = storeAddress || user.storeAddress;
			user.operatingHours = operatingHours || user.operatingHours;
		}

		// Handle profile picture upload
		if (req.file) {
			const profilePictureUpload = await uploadOnCloudinary(req.file, "kalyekart_profiles");

			if (profilePictureUpload && profilePictureUpload.secure_url) {
				user.profilePicture = profilePictureUpload.secure_url;
			} else {
				// If upload fails, stop the process and return an error
				return res.status(500).json({ message: "Failed to upload profile picture to Cloudinary." });
			}
		}

		// Save all changes to the user
		await user.save();

		// Prepare user object to return to the client
		const userToReturn = prepareUserResponse(user);

		res.status(200).json({
			message: "Profile updated successfully",
			user: userToReturn,
		});
	} catch (error) {
		console.error("Error in updateUserProfile controller:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};