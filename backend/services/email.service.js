import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Nodemailer Transporter
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

const sendTransactionalEmail = async (emailOptions) => {
	try {
		const info = await transporter.sendMail(emailOptions);
		console.log("Email sent successfully. MessageId: ", info.messageId);
		return info;
	} catch (error) {
		console.error("Error sending transactional email:", error.message);
		// Do not throw error to prevent crashing main flows
		return null;
	}
};

const loadTemplate = (templateName, data) => {
	const templatePath = path.resolve(__dirname, `../email-templates/${templateName}.html`);
	try {
		let template = fs.readFileSync(templatePath, "utf-8");

		// Inject current year automatically
		const currentYear = new Date().getFullYear();
		const mergedData = { ...data, currentYear };

		const replacePlaceholders = (template, data, prefix = "") => {
			for (const key in data) {
				const value = data[key];
				if (typeof value === "object" && value !== null) {
					template = replacePlaceholders(template, value, `${prefix}${key}.`);
				} else {
					const regex = new RegExp(`{{${prefix}${key}}}`, "g");
					template = template.replace(regex, value);
				}
			}
			return template;
		};

		return replacePlaceholders(template, mergedData);
	} catch (error) {
		console.error(`Error loading template ${templateName}:`, error.message);
		return "";
	}
};

const EmailService = {
	sendOrderConfirmationEmail: async (user, order, products) => {
		const customerTemplateData = {
			customerName: user.name,
			orderId: order._id.toString(),
			orderIdShort: order._id.toString().slice(-6),
			orderDate: new Date(order.createdAt).toLocaleDateString(),
			shippingAddress: `${order.shippingAddress.sitio}, ${order.shippingAddress.barangay}, ${order.shippingAddress.city}`,
			items: products
				.map((p) => `<li>${p.name} (x${p.quantity}) - ₱${(p.price * p.quantity).toFixed(2)}</li>`)
				.join(""),
			subtotal: `₱${order.subtotal.toFixed(2)}`,
			deliveryFee: `₱${order.deliveryFee.toFixed(2)}`,
			discount:
				order.discount && order.discount.code
					? `<p><strong>Discount (${order.discount.code}):</strong> -₱${order.discountAmount.toFixed(2)}</p>`
					: "",
			total: `₱${order.totalAmount.toFixed(2)}`,
			domain: "kalyekart.app",
		};

		const adminTemplateData = {
			orderId: order._id.toString(),
			orderIdShort: order._id.toString().slice(-6),
			customerName: user.name,
			orderDate: new Date(order.createdAt).toLocaleDateString(),
			totalAmount: `₱${order.totalAmount.toFixed(2)}`,
			deliveryAddress: order.shippingAddress,
			discount:
				order.discount && order.discount.code
					? `<li><span>Discount (${order.discount.code}):</span><strong>-₱${order.discountAmount.toFixed(
							2
					  )}</strong></li>`
					: "",
			domain: "kalyekart.app",
		};

		const customerEmail = {
			from: `"KalyeKart" <${process.env.EMAIL_USER}>`,
			to: user.email,
			subject: `Your KalyeKart Order #${customerTemplateData.orderIdShort} is Confirmed!`,
			html: loadTemplate("customer_order_confirmation", customerTemplateData),
		};

		const adminEmail = {
			from: `"KalyeKart System" <${process.env.EMAIL_USER}>`,
			to: process.env.EMAIL_USER,
			subject: `New Order Received #${adminTemplateData.orderIdShort}`,
			html: loadTemplate("admin_new_order", adminTemplateData),
		};

		await sendTransactionalEmail(customerEmail);
		await sendTransactionalEmail(adminEmail);
	},

	sendOrderStatusUpdateEmail: async (user, order) => {
		const templateData = {
			customerName: user.name,
			orderId: order._id.toString(),
			orderIdShort: order._id.toString().slice(-6),
			newStatus: order.status,
			domain: "kalyekart.app",
		};

		const email = {
			from: `"KalyeKart" <${process.env.EMAIL_USER}>`,
			to: user.email,
			subject: `Your KalyeKart Order #${templateData.orderIdShort} has been updated`,
			html: loadTemplate("customer_order_status_update", templateData),
		};

		await sendTransactionalEmail(email);
	},

	sendFeedbackConfirmationEmail: async (user, feedback) => {
		const customerTemplateData = {
			customerName: user.name,
			domain: "kalyekart.app",
		};

		const adminTemplateData = {
			customerName: user.name,
			rating: feedback.rating,
			feedback: feedback.feedback,
			domain: "kalyekart.app",
		};

		const customerEmail = {
			from: `"KalyeKart" <${process.env.EMAIL_USER}>`,
			to: user.email,
			subject: "We've Received Your Feedback!",
			html: loadTemplate("customer_feedback_confirmation", customerTemplateData),
		};

		const adminEmail = {
			from: `"KalyeKart System" <${process.env.EMAIL_USER}>`,
			to: process.env.EMAIL_USER,
			subject: "New Customer Feedback Received",
			html: loadTemplate("admin_new_feedback", adminTemplateData),
		};

		await sendTransactionalEmail(customerEmail);
		await sendTransactionalEmail(adminEmail);
	},

	sendRefundRequestEmail: async (user, order) => {
		const adminTemplateData = {
			customerName: user.name,
			orderId: order._id.toString(),
			orderIdShort: order._id.toString().slice(-6),
			reason: order.refundRequest.reason,
			domain: "kalyekart.app",
		};

		const adminEmail = {
			from: `"KalyeKart System" <${process.env.EMAIL_USER}>`,
			to: process.env.EMAIL_USER,
			subject: `New Refund Request for Order #${adminTemplateData.orderIdShort}`,
			html: loadTemplate("admin_refund_request", adminTemplateData),
		};

		await sendTransactionalEmail(adminEmail);
	},

	sendPasswordResetEmail: async (email, name, resetCode) => {
		const templateData = {
			customerName: name,
			resetCode: resetCode,
			domain: "kalyekart.app",
		};

		const mailOptions = {
			from: `"KalyeKart" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: "Password Reset Request",
			html: loadTemplate("password_reset", templateData),
		};

		await sendTransactionalEmail(mailOptions);
	},
};

export default EmailService;
