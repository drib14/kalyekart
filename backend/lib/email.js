import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

export const sendEmail = async (to, subject, html) => {
	try {
		const info = await transporter.sendMail({
			from: `"KalyeKart" <${process.env.EMAIL_USER}>`,
			to,
			subject,
			html,
		});
		console.log("Message sent: %s", info.messageId);
		return info;
	} catch (error) {
		console.error("Error sending email:", error);
		throw error;
	}
};
