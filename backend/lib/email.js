import sgMail from "@sendgrid/mail";
import SibApiV3Sdk from "sib-api-v3-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { emailQueue } from "./emailQueue.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variable validation
const {
	SENDGRID_API_KEY,
	BREVO_KEY,
	SENDER_EMAIL,
	SENDER_NAME,
} = process.env;

if (!SENDER_EMAIL || !SENDER_NAME) {
	console.error("SENDER_EMAIL and SENDER_NAME environment variables are required.");
	// In a real application, you might want to exit the process
	// process.exit(1);
}

// Configure SendGrid
if (SENDGRID_API_KEY) {
	sgMail.setApiKey(SENDGRID_API_KEY);
} else {
	console.warn("SENDGRID_API_KEY is not set. SendGrid will be unavailable.");
}

// Configure Brevo
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
if (BREVO_KEY) {
	apiKey.apiKey = BREVO_KEY;
} else {
	console.warn("BREVO_KEY is not set. Brevo will be unavailable.");
}
const brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();


/**
 * Loads a specific email template and populates it with dynamic data.
 * @param {string} templateName - The name of the HTML template file (e.g., "welcome").
 * @param {object} data - The data to inject into the template's placeholders.
 * @returns {string} The processed HTML content.
 * @throws {Error} If the template file is not found.
 */
const loadTemplate = (templateName, data) => {
	const templatePath = path.join(__dirname, `../templates/${templateName}.html`);
	if (!fs.existsSync(templatePath)) {
		throw new Error(`Email template not found: ${templateName}.html`);
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
 * Sends an email using available providers.
 * This function is intended to be called by the background worker.
 * It will try SendGrid first, then fall back to Brevo.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {string} templateName - The name of the template to use.
 * @param {object} data - The data to populate the template with.
 * @throws {Error} If the email fails to send with all providers.
 */
const _sendEmail = async (to, subject, templateName, data) => {
	const htmlContent = loadTemplate(templateName, data);
	let emailSent = false;

	// Attempt to send with SendGrid
	if (SENDGRID_API_KEY) {
		try {
			const msg = {
				to: to,
				from: {
					name: SENDER_NAME,
					email: SENDER_EMAIL,
				},
				subject: subject,
				html: htmlContent,
			};
			await sgMail.send(msg);
			console.log(`Email sent to ${to} via SendGrid.`);
			emailSent = true;
		} catch (error) {
			console.error(`SendGrid failed for ${to}: ${error.message}. Falling back to Brevo.`);
		}
	}

	// If SendGrid failed or was unavailable, try Brevo
	if (!emailSent && BREVO_KEY) {
		try {
			const sendSmtpEmail = {
				sender: { email: SENDER_EMAIL, name: SENDER_NAME },
				to: [{ email: to }],
				subject: subject,
				htmlContent: htmlContent,
			};
			await brevoApi.sendTransacEmail(sendSmtpEmail);
			console.log(`Email sent to ${to} via Brevo.`);
			emailSent = true;
		} catch (error) {
			console.error(`Brevo failed for ${to}: ${error.response ? error.response.data : error.message}`);
		}
	}

	// If the email was still not sent, throw an error to be caught by the worker
	if (!emailSent) {
		throw new Error(`Failed to send email to ${to} using all available providers.`);
	}
};

/**
 * Adds an email job to the BullMQ queue.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {string} templateName - The name of the template to use.
 * @param {object} data - The data to populate the template with.
 */
export const sendEmail = async (to, subject, templateName, data) => {
	if (!SENDER_EMAIL || !SENDER_NAME) {
		console.error("Cannot queue email: SENDER_EMAIL or SENDER_NAME is not configured.");
		return;
	}
	console.log(`[EMAIL_QUEUE] Adding email job for ${to} with subject: ${subject}`);
	await emailQueue.add("send-email", { to, subject, templateName, data });
};

// Export the internal send function for the worker
export { _sendEmail };