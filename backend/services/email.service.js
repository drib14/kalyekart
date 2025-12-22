import brevo from "@getbrevo/brevo";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_KEY;

const sendTransactionalEmail = async (emailDetails) => {
	try {
		const sendSmtpEmail = new brevo.SendSmtpEmail();
		Object.assign(sendSmtpEmail, emailDetails);
		const { response, body } = await apiInstance.sendTransacEmail(sendSmtpEmail);
		console.log("Email sent successfully. Response: ", body);
		return { response, body };
	} catch (error) {
		console.error("Error sending transactional email:", error.response ? error.response.body : error.message);
		// Do not throw error to prevent crashing main flows
		return null;
	}
};

const loadTemplate = (templateName, data) => {
	const templatePath = path.resolve(__dirname, `../email-templates/${templateName}.html`);
	let template = fs.readFileSync(templatePath, "utf-8");

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

	return replacePlaceholders(template, data);
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
			to: [{ email: user.email, name: user.name }],
			sender: { email: process.env.EMAIL_USER, name: "KalyeKart" },
			subject: `Your KalyeKart Order #${customerTemplateData.orderIdShort} is Confirmed!`,
			htmlContent: loadTemplate("customer_order_confirmation", customerTemplateData),
		};

		const adminEmail = {
			to: [{ email: process.env.EMAIL_USER, name: "KalyeKart Admin" }],
			sender: { email: process.env.EMAIL_USER, name: "KalyeKart System" },
			subject: `New Order Received #${adminTemplateData.orderIdShort}`,
			htmlContent: loadTemplate("admin_new_order", adminTemplateData),
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
			to: [{ email: user.email, name: user.name }],
			sender: { email: process.env.EMAIL_USER, name: "KalyeKart" },
			subject: `Your KalyeKart Order #${templateData.orderIdShort} has been updated`,
			htmlContent: loadTemplate("customer_order_status_update", templateData),
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
			to: [{ email: user.email, name: user.name }],
			sender: { email: process.env.EMAIL_USER, name: "KalyeKart" },
			subject: "We've Received Your Feedback!",
			htmlContent: loadTemplate("customer_feedback_confirmation", customerTemplateData),
		};

		const adminEmail = {
			to: [{ email: process.env.EMAIL_USER, name: "KalyeKart Admin" }],
			sender: { email: process.env.EMAIL_USER, name: "KalyeKart System" },
			subject: "New Customer Feedback Received",
			htmlContent: loadTemplate("admin_new_feedback", adminTemplateData),
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
			to: [{ email: process.env.EMAIL_USER, name: "KalyeKart Admin" }],
			sender: { email: process.env.EMAIL_USER, name: "KalyeKart System" },
			subject: `New Refund Request for Order #${adminTemplateData.orderIdShort}`,
			htmlContent: loadTemplate("admin_refund_request", adminTemplateData),
		};

		await sendTransactionalEmail(adminEmail);
	},
};

export default EmailService;