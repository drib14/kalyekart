import Notification from "../models/notification.model.js";
import NotificationService from "../services/notification.service.js";

export const getNotifications = async (req, res) => {
	try {
		const userId = req.user._id;
		const notifications = await Notification.find({ recipient: userId })
			.populate("sender", "name profilePicture")
			.sort({ createdAt: -1 });
		res.status(200).json(notifications);
	} catch (error) {
		console.error("Error in getNotifications controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const streamNotifications = (req, res) => {
	const userId = req.user._id;

	res.setHeader("Content-Type", "text/event-stream");
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("Connection", "keep-alive");
	res.flushHeaders();

	NotificationService.addClient(userId, res);

	req.on("close", () => {
		NotificationService.removeClient(userId);
		res.end();
	});
};

export const markAsRead = async (req, res) => {
	try {
		const { notificationId } = req.params;
		const userId = req.user._id;

		const notification = await Notification.findById(notificationId);

		if (!notification) {
			return res.status(404).json({ message: "Notification not found" });
		}

		if (notification.recipient.toString() !== userId.toString()) {
			return res.status(403).json({ message: "Not authorized to update this notification" });
		}

		notification.isRead = true;
		await notification.save();

		res.status(200).json(notification);
	} catch (error) {
		console.error("Error in markAsRead controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const markAllAsRead = async (req, res) => {
	try {
		const userId = req.user._id;
		await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
		res.status(200).json({ message: "All notifications marked as read" });
	} catch (error) {
		console.error("Error in markAllAsRead controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};