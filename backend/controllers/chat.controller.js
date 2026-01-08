import Message from "../models/message.model.js";
import { uploadOnCloudinary } from "../lib/cloudinary.js";

export const getMessages = async (req, res) => {
	try {
		const { orderId } = req.params;
		const messages = await Message.find({ orderId }).populate("sender", "name profilePicture").sort({ createdAt: 1 });
		res.json(messages);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const sendMessage = async (req, res) => {
	try {
		const { orderId } = req.params;
		const { content } = req.body;
		const sender = req.user._id;

		let mediaUrl = null;
		let mediaType = null;

		if (req.file) {
			const uploadResponse = await uploadOnCloudinary(req.file, "kalyekart_chat");
			if (uploadResponse) {
				mediaUrl = uploadResponse.secure_url;
				mediaType = req.file.mimetype.startsWith("image") ? "image" : "video";
			}
		}

		const message = await Message.create({
			orderId,
			sender,
			content,
			mediaUrl,
			mediaType,
		});

		await message.populate("sender", "name profilePicture");

		// Emit via Socket.IO
		const io = req.app.get("io");
		if (io) {
			io.to(`order_${orderId}`).emit("new_message", message);
		}

		res.status(201).json(message);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
