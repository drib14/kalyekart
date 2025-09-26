import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

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
 * Sends an email using a specific template.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {string} templateName - The name of the template to use.
 * @param {object} data - The data to populate the template with.
 */
export const sendEmail = async (to, subject, templateName, data) => {
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
        console.error(`Error sending email to ${to}:`, error);
        // We don't want to throw an error here to not interrupt the main flow
    }
};