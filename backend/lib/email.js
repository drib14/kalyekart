import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let resend;
let isEmailServiceEnabled = false;

(async () => {
	if (process.env.RESEND_SECRET) {
		resend = new Resend(process.env.RESEND_SECRET);
		console.log("Email service is configured and ready.");
		isEmailServiceEnabled = true;
	} else {
		console.warn("Resend secret not found. Email sending will be disabled.");
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
		await resend.emails.send({
			from: "Kalyekart <kalyekart@gmail.com>",
			to,
			subject,
			html: htmlContent,
		});
		console.log(`Email sent to ${to} with subject: ${subject}`);
	} catch (error) {
		console.error(`Error sending email to ${to}:`, error.message);
	}
};