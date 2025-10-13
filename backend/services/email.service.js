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
		throw error;
	}
};

const loadTemplate = (templateName, data) => {
	const templatePath = path.resolve(__dirname, `../email-templates/${templateName}.html`);
	let template = fs.readFileSync(templatePath, "utf-8");
	for (const key in data) {
		const regex = new RegExp(`{{${key}}}`, "g");
		template = template.replace(regex, data[key]);
	}
	return template;
};

const EmailService = {
	sendOrderConfirmationEmail: async (user, order, products) => {
		const customerTemplateData = {
			customerName: user.name,
			orderId: order._id.toString().slice(-6),
			orderDate: new Date(order.createdAt).toLocaleDateString(),
			shippingAddress: `${order.shippingAddress.street}, ${order.shippingAddress.barangay}, ${order.shippingAddress.city}`,
			items: products
				.map((p) => `<li>${p.name} (x${p.quantity}) - ₱${(p.price * p.quantity).toFixed(2)}</li>`)
				.join(""),
			subtotal: `₱${order.subtotal.toFixed(2)}`,
			deliveryFee: `₱${order.deliveryFee.toFixed(2)}`,
			total: `₱${order.totalAmount.toFixed(2)}`,
			domain: "kalyekart.app",
		};

		const adminTemplateData = {
			orderId: order._id.toString().slice(-6),
			customerName: user.name,
			orderDate: new Date(order.createdAt).toLocaleDateString(),
			totalAmount: `₱${order.totalAmount.toFixed(2)}`,
			domain: "kalyekart.app",
		};

		const customerEmail = {
			to: [{ email: user.email, name: user.name }],
			sender: { email: process.env.EMAIL_USER, name: "KalyeKart" },
			subject: `Your KalyeKart Order #${customerTemplateData.orderId} is Confirmed!`,
			htmlContent: loadTemplate("customer_order_confirmation", customerTemplateData),
		};

		const adminEmail = {
			to: [{ email: process.env.EMAIL_USER, name: "KalyeKart Admin" }],
			sender: { email: process.env.EMAIL_USER, name: "KalyeKart System" },
			subject: `New Order Received #${adminTemplateData.orderId}`,
			htmlContent: loadTemplate("admin_new_order", adminTemplateData),
		};

		await sendTransactionalEmail(customerEmail);
		await sendTransactionalEmail(adminEmail);
	},

	sendOrderStatusUpdateEmail: async (user, order) => {
		const templateData = {
			customerName: user.name,
			orderId: order._id.toString().slice(-6),
			newStatus: order.status,
			domain: "kalyekart.app",
		};

		const email = {
			to: [{ email: user.email, name: user.name }],
			sender: { email: process.env.EMAIL_USER, name: "KalyeKart" },
			subject: `Your KalyeKart Order #${templateData.orderId} has been updated`,
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
			orderId: order._id.toString().slice(-6),
			reason: order.refundRequest.reason,
			domain: "kalyekart.app",
		};

		const adminEmail = {
			to: [{ email: process.env.EMAIL_USER, name: "KalyeKart Admin" }],
			sender: { email: process.env.EMAIL_USER, name: "KalyeKart System" },
			subject: `New Refund Request for Order #${adminTemplateData.orderId}`,
			htmlContent: loadTemplate("admin_refund_request", adminTemplateData),
		};

		await sendTransactionalEmail(adminEmail);
	},
};

export default EmailService;