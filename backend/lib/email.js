import sgMail from "@sendgrid/mail";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { emailQueue } from "./emailQueue.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Loads a specific email template and populates it with dynamic data.
 * @param {string} templateName - The name of the HTML template file (e.g., "welcome").
 * @param {object} data - The data to inject into the template's placeholders.
 * @returns {string} The processed HTML content.
 */
const loadTemplate = (templateName, data) => {
	const templatePath = path.join(__dirname, `../templates/${templateName}.html`);
	if (!fs.existsSync(templatePath)) {
		console.error(`Email template not found: ${templateName}.html`);
		return `<p>Error: Template not found.</p>`;
	}

	let htmlContent = fs.readFileSync(templatePath, "utf8");

	// Replace all placeholders (e.g., {{NAME}}) with actual data
	for (const key in data) {
		const regex = new RegExp(`{{${key}}}`, "g");
		htmlContent = htmlContent.replace(regex, data[key]);
	}

	return htmlContent;
};

/**
 * Sends an email using the SendGrid API.
 * This function is intended to be called by the background worker.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {string} templateName - The name of the template to use.
 * @param {object} data - The data to populate the template with.
 */
const _sendEmail = async (to, subject, templateName, data) => {
	try {
		const htmlContent = loadTemplate(templateName, data);

		const msg = {
			to: to,
			from: process.env.EMAIL_USER, // This must be a verified sender in SendGrid
			subject: subject,
			html: htmlContent,
		};

		await sgMail.send(msg);
		console.log(`Email sent to ${to} with subject: ${subject} via SendGrid.`);
	} catch (error) {
		console.error(`Error sending email to ${to} via SendGrid:`, error);
		if (error.response) {
			console.error("SendGrid Error Body:", error.response.body);
		}
		throw error; // Re-throw the error to be caught by the worker
	}
};

/**
 * Adds a job to the email queue.
 * This is the function that should be called from the controllers.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {string} templateName - The name of the template to use.
 * @param {object} data - The data to populate the template with.
 */
export const sendEmail = async (to, subject, templateName, data) => {
	console.log(`[EMAIL_QUEUE] Adding SendGrid job for ${to} with subject: ${subject}`);
	await emailQueue.add("send-email", { to, subject, templateName, data });
};

// Export the internal send function for the worker
export { _sendEmail };