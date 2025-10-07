import SibApiV3Sdk from "sib-api-v3-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { BREVO_KEY, EMAIL_USER, SENDER_NAME: CUSTOM_SENDER_NAME } = process.env;
const SENDER_EMAIL = EMAIL_USER;
const SENDER_NAME = CUSTOM_SENDER_NAME || "KalyeKart";

if (!SENDER_EMAIL) {
	console.error("EMAIL_USER environment variable is required.");
}

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];

if (BREVO_KEY) {
	apiKey.apiKey = BREVO_KEY;
} else {
	console.warn("BREVO_KEY is not set. Brevo will be unavailable.");
}
const brevoApi = new SibApiV3Sdk.TransactionalEmailsApi();

const loadTemplate = (templateName, data) => {
	const templatePath = path.join(__dirname, `../templates/${templateName}.html`);
	if (!fs.existsSync(templatePath)) {
		throw new Error(`Email template not found: ${templateName}.html`);
	}

	let htmlContent = fs.readFileSync(templatePath, "utf8");
	htmlContent = htmlContent.replace(/{{YEAR}}/g, new Date().getFullYear());

	for (const key in data) {
		const regex = new RegExp(`{{${key}}}`, "g");
		htmlContent = htmlContent.replace(regex, data[key]);
	}

	return htmlContent;
};

export const _sendEmail = async (to, subject, templateName, data) => {
	if (!BREVO_KEY) {
		console.error("Cannot send email: BREVO_KEY is not configured.");
		return;
	}

	const htmlContent = loadTemplate(templateName, data);
	console.log(`[EMAIL] Preparing to send email directly to ${to} with subject: ${subject}`);

	try {
		const sendSmtpEmail = {
			sender: { email: SENDER_EMAIL, name: SENDER_NAME },
			to: [{ email: to }],
			subject: subject,
			htmlContent: htmlContent,
		};

		const response = await brevoApi.sendTransacEmail(sendSmtpEmail);
		console.log(`[BREVO API] Successfully sent email to ${to}. Brevo Message ID:`, response.messageId);
	} catch (error) {
		console.error(
			`[BREVO API ERROR] Failed to send email to ${to}. Reason: ${
				error.response ? JSON.stringify(error.response.data, null, 2) : error.message
			}`
		);
		// Do not re-throw, just log the error.
	}
};