import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../lib/cloudinary.js";

export const updateUserProfile = async (req, res) => {
	try {
		const { name, email } = req.body;
		const userId = req.user._id;

		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.name = name || user.name;
		user.email = email || user.email;

		if (req.file) {
			const profilePictureUpload = await uploadOnCloudinary(req.file.path);
			if (profilePictureUpload) {
				user.profilePicture = profilePictureUpload.secure_url;
			} else {
				return res.status(500).json({ message: "Failed to upload profile picture" });
			}
		}

		await user.save();

		res.status(200).json({
			message: "Profile updated successfully",
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				profilePicture: user.profilePicture,
				hasSetSecurityQuestions: user.hasSetSecurityQuestions,
			},
		});
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
