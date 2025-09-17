import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

export const sendWelcomeEmail = async (to, name) => {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to,
		subject: "Welcome to KalyeKart!",
		html: `
            <h1>Welcome to KalyeKart, ${name}!</h1>
            <p>We are excited to have you on board.</p>
            <p>Start browsing our delicious pungko-pungko offerings now!</p>
        `,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("Welcome email sent successfully.");
	} catch (error) {
		console.error("Error sending welcome email:", error);
	}
};

export const sendOrderConfirmationEmail = async (to, order) => {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to,
		subject: `Your KalyeKart Order #${order._id} is confirmed!`,
		html: `
            <h1>Order Confirmed!</h1>
            <p>Thank you for your order. We've received it and will start processing it right away.</p>
            <h2>Order Summary</h2>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total Amount:</strong> PHP${order.totalAmount.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            <h3>Shipping Address</h3>
            <p>${order.shippingAddress.street}, ${order.shippingAddress.barangay}</p>
            <p>${order.shippingAddress.city}, ${order.shippingAddress.province} ${order.shippingAddress.zipCode}</p>
            <h3>Items</h3>
            <ul>
                ${order.products
									.map(
										(p) =>
											`<li>${p.product.name} - ${p.quantity} x PHP${p.price.toFixed(2)}</li>`
									)
									.join("")}
            </ul>
        `,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("Order confirmation email sent successfully.");
	} catch (error) {
		console.error("Error sending order confirmation email:", error);
	}
};
