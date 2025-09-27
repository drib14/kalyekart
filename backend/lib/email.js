import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let transporter;
let isEmailServiceEnabled = false; // Start with the service disabled

// --- Email Service Initialization ---
// We use an async IIFE to handle the async verification process on startup.
(async () => {
	if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
		transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure: true,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
			// Add a timeout to prevent long hangs on verification
			connectionTimeout: 10000, // 10 seconds
		});

		try {
			// Verify the connection and credentials
			await transporter.verify();
			console.log("Email service is configured and ready.");
			isEmailServiceEnabled = true;
		} catch (error) {
			console.error(
				"Email service verification failed. Emails will be disabled.",
				error.message
			);
			// Ensure the service remains disabled
			isEmailServiceEnabled = false;
		}
	} else {
		console.warn(
			"Email credentials (EMAIL_USER, EMAIL_PASS) not found. Email sending will be disabled."
		);
	}
})();

const loadTemplate = (templateName, data) => {
	const templatePath = path.join(__dirname, `../templates/${templateName}.html`);
	if (!fs.existsSync(templatePath)) {
		console.error(`Email template not found: ${templateName}.html`);
		return `<p>Error: Template not found.</p>`;
	}

	let htmlContent = fs.readFileSync(templatePath, "utf8");

	for (const key in data) {
		const regex = new RegExp(`{{${key}}}`, "g");
		htmlContent = htmlContent.replace(regex, data[key]);
	}

	return htmlContent;
};

export const sendEmail = async (to, subject, templateName, data) => {
	// If the email service is not enabled (due to missing creds or verification failure), do nothing.
	if (!isEmailServiceEnabled) {
		console.warn(`Skipping email to ${to} because email service is not enabled.`);
		return;
	}

	try {
		const htmlContent = loadTemplate(templateName, data);

		const mailOptions = {
			from: `"Kalyekart" <${process.env.EMAIL_USER}>`,
			to,
			subject,
			html: htmlContent,
		};

		await transporter.sendMail(mailOptions);
		console.log(`Email sent to ${to} with subject: ${subject}`);
	} catch (error) {
		// Log the error but don't throw, to avoid interrupting the main application flow.
		console.error(`Error sending email to ${to}:`, error.message);
	}
};