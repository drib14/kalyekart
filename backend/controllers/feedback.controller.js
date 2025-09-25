import nodemailer from "nodemailer";

export const submitFeedback = async (req, res) => {
	const { rating, feedback } = req.body;

	const transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});

	const mailOptions = {
		from: `"Kalyekart Feedback" <${process.env.EMAIL_USER}>`,
		to: process.env.EMAIL_USER,
		subject: "New Feedback Submission",
		html: `
			<h1>New Feedback Submission</h1>
			<p><strong>Rating:</strong> ${rating}/5</p>
			<p><strong>Feedback:</strong></p>
			<p>${feedback}</p>
		`,
	};

	try {
		await transporter.sendMail(mailOptions);
		res.status(200).json({ message: "Feedback submitted successfully" });
	} catch (error) {
		console.error("Error sending feedback email:", error);
		res.status(500).json({ message: "Failed to submit feedback", error: error.message });
	}
};