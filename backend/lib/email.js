import SibApiV3Sdk from "sib-api-v3-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Queue } from "bullmq";
import { redis } from "../lib/redis.js";

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

const emailQueue = new Queue("email-queue", { connection: redis });

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

		if (replyTo && to === SENDER_EMAIL) {
			const [localPart, domain] = SENDER_EMAIL.split("@");
			const aliasTo = `${localPart}+notifications@${domain}`;
			sendSmtpEmail.to = [{ email: aliasTo }];
			sendSmtpEmail.sender = { email: SENDER_EMAIL, name: `${replyTo.name} via ${SENDER_NAME}` };
			sendSmtpEmail.replyTo = replyTo;
		}

		const response = await brevoApi.sendTransacEmail(sendSmtpEmail);
		console.log(`[BREVO API] Successfully sent email to ${sendSmtpEmail.to[0].email}. Brevo Message ID:`, response.messageId);
	} catch (error) {
		console.error(
			`Brevo failed for ${to}: ${error.response ? JSON.stringify(error.response.data, null, 2) : error.message}`
		);
		throw new Error(`Failed to send email to ${to} via Brevo.`);
	}
};

export const sendEmail = async (to, subject, templateName, data, replyTo = null) => {
	if (!SENDER_EMAIL) {
		console.error("Cannot queue email: EMAIL_USER is not configured.");
		return;
	}

	const jobName = `${templateName}-${to}`;
	const jobData = { to, subject, templateName, data, replyTo };

	try {
		await emailQueue.add(jobName, jobData, {
			removeOnComplete: true,
			removeOnFail: false,
			attempts: 3,
			backoff: {
				type: "exponential",
				delay: 1000,
			},
		});
		console.log(`[EMAIL_QUEUE] Successfully queued email job '${jobName}' for ${to}`);
	} catch (error) {
		console.error(`[EMAIL_QUEUE] Failed to queue email job for ${to}:`, error);
	}
};

export { _sendEmail };