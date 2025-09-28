import sgMail from "@sendgrid/mail";
import Brevo from "@getbrevo/brevo";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { emailQueue } from "./emailQueue.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the SendGrid API key
if (process.env.SENDGRID_API_KEY) {
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Configure Brevo
const defaultClient = Brevo.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_KEY;

const brevoApi = new Brevo.TransactionalEmailsApi();


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
	const htmlContent = loadTemplate(templateName, data);
	let emailSent = false;

	// First, try sending with SendGrid if the API key is available
	if (process.env.SENDGRID_API_KEY) {
		try {
			const msg = {
				to: to,
				from: process.env.EMAIL_USER,
				subject: subject,
				html: htmlContent,
			};
			await sgMail.send(msg);
			console.log(`Email sent to ${to} via SendGrid.`);
			emailSent = true;
		} catch (error) {
			console.error(`SendGrid failed: ${error.message}. Trying Brevo as a fallback.`);
		}
	}

	// If SendGrid was not used or failed, try Brevo
	if (!emailSent) {
		try {
			const sendSmtpEmail = new Brevo.SendSmtpEmail();
			sendSmtpEmail.sender = { email: process.env.EMAIL_USER, name: "KalyeKart" };
			sendSmtpEmail.to = [{ email: to }];
			sendSmtpEmail.subject = subject;
			sendSmtpEmail.htmlContent = htmlContent;

			await brevoApi.sendTransacEmail(sendSmtpEmail);
			console.log(`Email sent to ${to} via Brevo.`);
			emailSent = true;
		} catch (error) {
			console.error(`Error sending email to ${to} via Brevo:`, error);
			// The email was not sent, so we will fall through to the final error.
		}
	}

	// If the email was still not sent after trying all providers, throw an error.
	if (!emailSent) {
		throw new Error(`Failed to send email to ${to} using all available providers.`);
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
	console.log(`[EMAIL_QUEUE] Adding email job for ${to} with subject: ${subject}`);
	await emailQueue.add("send-email", { to, subject, templateName, data });
};

// Export the internal send function for the worker
export { _sendEmail };