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
			{
				name: "Admin",
				title: "New Feedback Received",
				body: `A user has submitted new feedback.<br><br>
					   <strong>User:</strong> ${user?.name || "Anonymous"} (${user?.email || "No email provided"})<br>
					   <strong>Rating:</strong> ${rating}/5<br>
					   <strong>Message:</strong><br>${feedback}`,
			}
		);

		// 2. Send a confirmation email to the user, if they are logged in
		if (user && user.email) {
			await sendEmail(
				user.email,
				"We've Received Your Feedback!",
				{
					name: user.name,
					title: "Thank You For Your Feedback!",
					body: "We have successfully received your feedback and appreciate you taking the time to help us improve. Our team will review your comments shortly.",
					cta: {
						text: "Continue Shopping",
						link: `${process.env.CLIENT_URL}/`,
					},
				}
			);
		}

		res.status(200).json({ message: "Feedback submitted successfully" });
	} catch (error) {
		console.error("Error sending feedback email:", error);
		res.status(500).json({ message: "Failed to submit feedback", error: error.message });
	}
};