import SibApiV3Sdk from "sib-api-v3-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
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

	// Add the current year automatically to all templates
	htmlContent = htmlContent.replace(/{{YEAR}}/g, new Date().getFullYear());

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
const _sendEmail = async (to, subject, templateName, data, replyTo = null) => {
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

		// If a replyTo address is provided for an admin email, use an alias for the 'to' address
		// and set the sender name to include the customer's name to improve deliverability.
		if (replyTo && to === SENDER_EMAIL) {
			const [localPart, domain] = SENDER_EMAIL.split("@");
			const aliasTo = `${localPart}+notifications@${domain}`;
			sendSmtpEmail.to = [{ email: aliasTo }];
			sendSmtpEmail.sender = { email: SENDER_EMAIL, name: `${replyTo.name} via ${SENDER_NAME}` };
			sendSmtpEmail.replyTo = replyTo;

			// Save the email content to a file for debugging
			const debugFilePath = path.join(__dirname, "../../last_admin_email.html");
			fs.writeFileSync(debugFilePath, htmlContent);
			console.log(`[DEBUG] Admin email HTML content saved to ${debugFilePath}`);
		}

		console.log(`[EMAIL PAYLOAD] Preparing to send email. Payload:`, JSON.stringify(sendSmtpEmail, null, 2));
		const response = await brevoApi.sendTransacEmail(sendSmtpEmail);
		console.log(`[BREVO API] Successfully sent email to ${sendSmtpEmail.to[0].email}. Brevo Message ID:`, response.messageId);
	} catch (error) {
		console.error(
			`Brevo failed for ${to}: ${error.response ? JSON.stringify(error.response.data, null, 2) : error.message}`
		);
		throw new Error(`Failed to send email to ${to} via Brevo.`);
	}
};

/**
 * Sends an email directly, bypassing the queue.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {string} templateName - The name of the template to use.
 * @param {object} data - The data to populate the template with.
 * @param {object|null} replyTo - Optional object with `email` and `name` for the Reply-To header.
 */
export const sendEmail = async (to, subject, templateName, data, replyTo = null) => {
	if (!SENDER_EMAIL) {
		console.error("Cannot send email: EMAIL_USER is not configured.");
		return;
	}
	console.log(`[EMAIL] Sending email directly to ${to} with subject: ${subject}`);
	try {
		await _sendEmail(to, subject, templateName, data, replyTo);
	} catch (error) {
		console.error(`[EMAIL] Failed to send email directly to ${to}:`, error);
	}
};

export { _sendEmail };