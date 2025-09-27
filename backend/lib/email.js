import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let transporter;
let isEmailServiceEnabled = false;

(async () => {
	// Production-ready configuration (e.g., for Render with a dedicated email service)
	if (process.env.EMAIL_HOST && process.env.EMAIL_PORT && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
		console.log("Attempting to configure email service with production settings...");
		transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: parseInt(process.env.EMAIL_PORT, 10),
			secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
			connectionTimeout: 10000, // 10 seconds
		});
	// Fallback to original Gmail configuration
	} else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
		console.log("Production email settings not found. Falling back to Gmail SMTP configuration...");
		transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 587,
			secure: false, // Port 587 uses STARTTLS
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
			connectionTimeout: 10000, // 10 seconds
		});
	} else {
		console.warn("Email credentials not found. Email sending will be disabled.");
		return; // Exit if no credentials are provided
	}

	try {
		await transporter.verify();
		console.log("Email service is configured and ready.");
		isEmailServiceEnabled = true;
	} catch (error) {
		console.error("Email service verification failed. Emails will be disabled.", error.message);
		isEmailServiceEnabled = false;
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
		console.error(`Error sending email to ${to}:`, error.message);
	}
};