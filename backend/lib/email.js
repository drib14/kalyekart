import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let resend;
let isEmailServiceEnabled = false;

// Initialize Resend client
try {
  if (process.env.RESEND_SECRET) {
    resend = new Resend(process.env.RESEND_SECRET);
    console.log("Email service is configured and ready to use Resend.");
    isEmailServiceEnabled = true;
  } else {
    console.warn("RESEND_SECRET not found in environment variables. Email sending will be disabled.");
    isEmailServiceEnabled = false;
  }
} catch (error) {
  console.error("Failed to initialize Resend client. Email sending will be disabled.", error);
  isEmailServiceEnabled = false;
}

const loadTemplate = (templateName, data) => {
	const templatePath = path.join(__dirname, `../templates/${templateName}.html`);
	if (!fs.existsSync(templatePath)) {
		console.error(`Email template not found: ${templateName}.html`);
		// Return a very basic fallback to avoid breaking the flow.
		return `<p>Error: Email template not found.</p>`;
	}
	let htmlContent = fs.readFileSync(templatePath, "utf8");
	// Replace all placeholders in the template
	for (const key in data) {
		const regex = new RegExp(`{{${key}}}`, "g");
		htmlContent = htmlContent.replace(regex, data[key]);
	}
	return htmlContent;
};

export const sendEmail = async (to, subject, templateName, data) => {
	if (!isEmailServiceEnabled) {
		console.warn(`Skipping email to ${to} because the email service is not enabled.`);
		return;
	}

	try {
		const htmlContent = loadTemplate(templateName, data);

		const mailOptions = {
			from: "Kalyekart <onboarding@resend.dev>",
			to,
			subject,
			html: htmlContent,
		};

		const { data: responseData, error } = await resend.emails.send(mailOptions);

		if (error) {
			console.error(`Error sending email to ${to} using Resend:`, error);
			return;
		}

		console.log(`Email sent successfully to ${to} with subject: ${subject}. Message ID: ${responseData.id}`);

	} catch (error) {
		console.error(`An unexpected error occurred while sending email to ${to}:`, error.message);
	}
};