import Notification from "../models/notification.model.js";
import NotificationService from "../services/notification.service.js";

export const getNotifications = async (req, res) => {
	try {
		const { _id: userId, role } = req.user;

		// Admins can see all notifications, while customers only see their own.
		const query = role === "admin" ? {} : { recipient: userId };

		const notifications = await Notification.find(query)
			.populate("sender", "name profilePicture")
			.populate("recipient", "name") // Helpful for admin view
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

	// Send initial connection confirmation
	res.write(": connected\n\n");

	// Keep-alive heartbeat
	const intervalId = setInterval(() => {
		res.write(": keepalive\n\n");
	}, 30000);

	req.on("close", () => {
		clearInterval(intervalId);
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
		const result = await Notification.updateMany(
			{ recipient: userId, isRead: false },
			{ $set: { isRead: true } }
		);
		console.log(`[markAllAsRead] User: ${userId}, Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
		res.status(200).json({ message: "All notifications marked as read", result });
	} catch (error) {
		console.error("Error in markAllAsRead controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};