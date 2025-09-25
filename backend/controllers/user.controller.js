import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../lib/cloudinary.js";

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

		if (req.file) {
			const profilePictureUpload = await uploadOnCloudinary(req.file.path);
			if (profilePictureUpload) {
				user.profilePicture = profilePictureUpload.secure_url;
			} else {
				// Don't fail the whole request if only image upload fails
				console.error("Cloudinary upload failed, but profile data will be saved.");
			}
		}

		await user.save();

		const userToReturn = user.toObject();
		delete userToReturn.password;

		res.status(200).json({
			message: "Profile updated successfully",
			user: userToReturn,
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
