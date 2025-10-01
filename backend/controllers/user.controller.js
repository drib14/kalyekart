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

export const getDeliveryAddresses = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		res.status(200).json(user.deliveryAddresses);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const addDeliveryAddress = async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const newAddress = req.body;

		// If this is the first address, make it the default
		if (user.deliveryAddresses.length === 0) {
			newAddress.isDefault = true;
		} else if (newAddress.isDefault) {
			// If the new address is set as default, unset the current default
			user.deliveryAddresses.forEach((addr) => (addr.isDefault = false));
		}

		user.deliveryAddresses.push(newAddress);
		await user.save();
		res.status(201).json(user.deliveryAddresses);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const updateDeliveryAddress = async (req, res) => {
	const { addressId } = req.params;
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const address = user.deliveryAddresses.id(addressId);
		if (!address) {
			return res.status(404).json({ message: "Address not found" });
		}

		// If updating to be the default, unset other defaults
		if (req.body.isDefault) {
			user.deliveryAddresses.forEach((addr) => {
				if (addr._id.toString() !== addressId) {
					addr.isDefault = false;
				}
			});
		}

		Object.assign(address, req.body);
		await user.save();
		res.status(200).json(user.deliveryAddresses);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const deleteDeliveryAddress = async (req, res) => {
	const { addressId } = req.params;
	try {
		const user = await User.findById(req.user._id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const address = user.deliveryAddresses.id(addressId);
		if (!address) {
			return res.status(404).json({ message: "Address not found" });
		}

		const wasDefault = address.isDefault;
		address.remove();

		// If the deleted address was the default, set a new default if possible
		if (wasDefault && user.deliveryAddresses.length > 0) {
			user.deliveryAddresses[0].isDefault = true;
		}

		await user.save();
		res.status(200).json(user.deliveryAddresses);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const setDefaultDeliveryAddress = async (req, res) => {
	const { addressId } = req.params;
	try {
		const user = await User.findById(req.user._id);
		if (!user) return res.status(404).json({ message: "User not found" });

		const address = user.deliveryAddresses.id(addressId);
		if (!address) return res.status(404).json({ message: "Address not found" });

		user.deliveryAddresses.forEach((addr) => {
			addr.isDefault = addr._id.toString() === addressId;
		});

		await user.save();
		res.status(200).json(user.deliveryAddresses);
	} catch (error) {
		res.status(500).json({ message: "Server Error", error: error.message });
	}
};

export const saveFcmToken = async (req, res) => {
	try {
		const { token } = req.body;
		const userId = req.user._id;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.fcmToken = token;
		await user.save();

		res.status(200).json({ message: "FCM token saved successfully" });
	} catch (error) {
		console.error("Error in saveFcmToken controller:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};