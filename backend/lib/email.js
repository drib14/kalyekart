import SibApiV3Sdk from "sib-api-v3-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { emailQueue } from "./emailQueue.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variable validation
const { BREVO_KEY, EMAIL_USER, SENDER_NAME: CUSTOM_SENDER_NAME } = process.env;
const SENDER_EMAIL = EMAIL_USER;
const SENDER_NAME = CUSTOM_SENDER_NAME || "KalyeKart";

if (!SENDER_EMAIL) {
	console.error("EMAIL_USER environment variable is required.");
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

	for (const key in data) {
		const regex = new RegExp(`{{${key}}}`, "g");
		htmlContent = htmlContent.replace(regex, data[key]);
	}

	return htmlContent;
};

/**
 * Sends an email using Brevo.
 * This function is intended to be called by the background worker.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {string} templateName - The name of the template to use.
 * @param {object} data - The data to populate the template with.
 * @throws {Error} If the email fails to send.
 */
const _sendEmail = async (to, subject, templateName, data) => {
	if (!BREVO_KEY) {
		throw new Error("Cannot send email: BREVO_KEY is not configured.");
	}

	const htmlContent = loadTemplate(templateName, data);

	try {
		const sendSmtpEmail = {
			sender: { email: SENDER_EMAIL, name: SENDER_NAME },
			to: [{ email: to }],
			subject: subject,
			htmlContent: htmlContent,
		};

		// If sending to the platform's own email, set replyTo to prevent spam filters
		if (to === SENDER_EMAIL) {
			sendSmtpEmail.replyTo = { email: SENDER_EMAIL, name: SENDER_NAME };
		}

		const response = await brevoApi.sendTransacEmail(sendSmtpEmail);
		console.log(`Email sent to ${to} via Brevo. Response:`, JSON.stringify(response, null, 2));
	} catch (error) {
		console.error(
			`Brevo failed for ${to}: ${error.response ? JSON.stringify(error.response.data, null, 2) : error.message}`
		);
		throw new Error(`Failed to send email to ${to} via Brevo.`);
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
	if (!SENDER_EMAIL) {
		console.error("Cannot queue email: EMAIL_USER is not configured.");
		return;
	}

	// Safeguard: Do not send welcome emails to the platform's own email address
	if (templateName === "welcome" && to === SENDER_EMAIL) {
		console.log(`[EMAIL_QUEUE] Blocked welcome email to platform: ${to}`);
		return;
	}

	console.log(`[EMAIL_QUEUE] Adding email job for ${to} with subject: ${subject}`);
	await emailQueue.add("send-email", { to, subject, templateName, data });
};

export { _sendEmail };