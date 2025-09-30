import { sendEmail } from "../lib/email.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import NotificationService from "../services/notification.service.js";

export const submitFeedback = async (req, res) => {
	const { rating, feedback, user } = req.body;

	if (!rating || !feedback) {
		return res.status(400).json({ message: "Rating and feedback are required." });
	}

	try {
		const admin = await User.findOne({ role: "admin" });

		// 1. Send the detailed feedback to the admin
		await sendEmail(
			process.env.EMAIL_USER,
			`New Feedback Submission (Rating: ${rating}/5)`,
			"adminFeedbackNotification",
			{
				USER_NAME: user?.name || "Anonymous",
				USER_EMAIL: user?.email || "No email provided",
				RATING: rating,
				FEEDBACK_MESSAGE: feedback,
			}
		);

		// 2. Send a confirmation email to the user, if they are logged in
		if (user && user.email) {
			await sendEmail(
				user.email,
				"We've Received Your Feedback!",
				"userFeedbackConfirmation",
				{
					NAME: user.name,
					FEEDBACK_MESSAGE: feedback,
					CTA_LINK: "https://kalyekart.app",
				}
			);
		}

		// Create in-app notifications
		if (admin) {
			const adminNotification = new Notification({
				recipient: admin._id,
				sender: user?._id,
				type: "new_feedback",
				message: `${user?.name || "An anonymous user"} has submitted new feedback.`,
				link: `/secret-dashboard`,
			});
			await adminNotification.save();
			await adminNotification.populate("sender", "name profilePicture");
			NotificationService.sendNotification(admin._id.toString(), adminNotification);
		}

		if (user && user._id) {
			const customerNotification = new Notification({
				recipient: user._id,
				sender: admin ? admin._id : null,
				type: "new_feedback",
				message: "Thank you for your feedback! We appreciate you helping us improve.",
				link: `/`,
			});
			await customerNotification.save();
			await customerNotification.populate("sender", "name profilePicture");
			NotificationService.sendNotification(user._id.toString(), customerNotification);
		}

		res.status(200).json({ message: "Feedback submitted successfully" });
	} catch (error) {
		console.error("Error sending feedback email:", error);
		res.status(500).json({ message: "Failed to submit feedback", error: error.message });
	}
};