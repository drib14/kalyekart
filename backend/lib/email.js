import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let transporter;
let isEmailServiceConfigured = false;

// Only configure the email service if credentials are provided in the environment
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
	transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASS,
		},
	});
	isEmailServiceConfigured = true;
} else {
	console.warn(
		"Email credentials (EMAIL_USER, EMAIL_PASS) not found. Email sending will be disabled."
	);
}

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
	// If the email service is not configured, log a warning and do nothing.
	if (!isEmailServiceConfigured) {
		console.warn(`Skipping email to ${to} because email service is not configured.`);
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