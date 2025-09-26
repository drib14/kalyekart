import { sendEmail } from "../lib/email.js";

export const submitFeedback = async (req, res) => {
	const { rating, feedback, user } = req.body;

	if (!rating || !feedback) {
		return res.status(400).json({ message: "Rating and feedback are required." });
	}

	try {
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
					CTA_LINK: `${process.env.CLIENT_URL}/`,
				}
			);
		}

		res.status(200).json({ message: "Feedback submitted successfully" });
	} catch (error) {
		console.error("Error sending feedback email:", error);
		res.status(500).json({ message: "Failed to submit feedback", error: error.message });
	}
};