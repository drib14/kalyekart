import NotificationService from "../services/notification.service.js";

export const submitFeedback = async (req, res) => {
	const { rating, feedback, user } = req.body;

	if (!rating || !feedback) {
		return res.status(400).json({ message: "Rating and feedback are required." });
	}

	try {
		// Use the centralized notification service
		await NotificationService.createNotification("new_feedback", {
			actor: user, // The user submitting the feedback (can be null if anonymous)
			feedback: { rating, feedback },
		});

		res.status(200).json({ message: "Feedback submitted successfully" });
	} catch (error) {
		console.error("Error submitting feedback:", error);
		res.status(500).json({ message: "Failed to submit feedback", error: error.message });
	}
};