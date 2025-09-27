import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let transporter;
let isEmailServiceEnabled = false;

(async () => {
	if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
		transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure: true,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASS,
			},
			connectionTimeout: 10000, // 10 seconds
		});

		try {
			await transporter.verify();
			console.log("Email service is configured and ready.");
			isEmailServiceEnabled = true;
		} catch (error) {
			console.error("Email service verification failed. Emails will be disabled.", error.message);
			isEmailServiceEnabled = false;
		}
	} else {
		console.warn("Email credentials not found. Email sending will be disabled.");
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
		const mailOptions = {
			from: `"Kalyekart" <${process.env.EMAIL_USER}>`,
			to,
			subject,
			html: htmlContent,
		};
		await transporter.sendMail(mailOptions);
		console.log(`Email sent to ${to} with subject: ${subject}`);
	} catch (error) {
		console.error(`Error sending email to ${to}:`, error.message);
	}
};