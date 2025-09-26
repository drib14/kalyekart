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
 * Loads the professional email template and populates it with dynamic content.
 * @param {object} data - The data to populate the template with.
 * @param {string} data.subject - The subject of the email.
 * @param {string} data.title - The main title/header inside the email content.
 * @param {string} data.name - The recipient's name.
 * @param {string} data.body - The main paragraph content of the email.
 * @param {object} [data.cta] - Optional Call to Action details.
 * @param {string} data.cta.text - The text for the CTA button.
 * @param {string} data.cta.link - The URL for the CTA button.
 * @returns {string} The processed HTML content of the email.
 */
const loadAndProcessTemplate = (data) => {
    const templatePath = path.join(__dirname, "../templates/professional-email.html");
    let htmlContent = fs.readFileSync(templatePath, "utf8");

    // Generate CTA button HTML or an empty string
    const ctaButtonHtml = data.cta && data.cta.link && data.cta.text
        ? `<a href="${data.cta.link}" class="cta-button">${data.cta.text}</a>`
        : "";

    // Replace all placeholders
    htmlContent = htmlContent.replace(new RegExp(`{{SUBJECT}}`, "g"), data.subject);
    htmlContent = htmlContent.replace(new RegExp(`{{TITLE}}`, "g"), data.title);
    htmlContent = htmlContent.replace(new RegExp(`{{NAME}}`, "g"), data.name);
    htmlContent = htmlContent.replace(new RegExp(`{{BODY}}`, "g"), data.body);
    htmlContent = htmlContent.replace(new RegExp(`{{CTA_BUTTON}}`, "g"), ctaButtonHtml);

    return htmlContent;
};

/**
 * Sends a standardized professional email.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {object} content - The content for the email body.
 * @param {string} content.name - The recipient's name.
 * @param {string} content.title - The main title/header inside the email content.
 * @param {string} content.body - The main paragraph content of the email.
 * @param {object} [content.cta] - Optional Call to Action details.
 * @param {string} content.cta.text - The text for the CTA button.
 * @param {string} content.cta.link - The URL for the CTA button.
 */
export const sendEmail = async (to, subject, content) => {
    try {
        const emailData = { subject, ...content };
        const htmlContent = loadAndProcessTemplate(emailData);

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