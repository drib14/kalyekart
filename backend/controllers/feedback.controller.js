import nodemailer from "nodemailer";
import { sendEmail } from "../lib/email.js";

export const submitFeedback = async (req, res) => {
	const { rating, feedback, user } = req.body;

	if (!rating || !feedback) {
		return res.status(400).json({ message: "Rating and feedback are required." });
	}

	try {
		// 1. Send the detailed feedback to the admin
		const transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure: true,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
		});

		const adminMailOptions = {
			from: `"Kalyekart Feedback" <${process.env.EMAIL_USER}>`,
			to: process.env.EMAIL_USER,
			subject: `New Feedback Submission (Rating: ${rating}/5)`,
			html: `
				<h1>New Feedback Submission</h1>
				<p><strong>From:</strong> ${user?.name || "Anonymous"} (${user?.email || "No email provided"})</p>
				<p><strong>Rating:</strong> ${rating}/5</p>
				<p><strong>Feedback:</strong></p>
				<p>${feedback}</p>
			`,
		};

		await transporter.sendMail(adminMailOptions);

		// 2. Send a confirmation email to the user, if they are logged in
		if (user && user.email) {
			await sendEmail(
				user.email,
				"We've Received Your Feedback!",
				"userFeedback",
				{
					USER_NAME: user.name,
					FEEDBACK_MESSAGE: feedback,
				}
			);
		}

		res.status(200).json({ message: "Feedback submitted successfully" });
	} catch (error) {
		console.error("Error sending feedback email:", error);
		res.status(500).json({ message: "Failed to submit feedback", error: error.message });
	}
};