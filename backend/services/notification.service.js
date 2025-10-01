import Notification from "../models/notification.model.js";
import { sendEmail } from "../lib/email.js";
import User from "../models/user.model.js";

// A simple in-memory store for active client connections for SSE
const clients = {};

const NotificationService = {
	addClient: (userId, res) => {
		clients[userId] = res;
		console.log(`[SSE] Client connected for user: ${userId}`);
	},

	removeClient: (userId) => {
		delete clients[userId];
		console.log(`[SSE] Client disconnected for user: ${userId}`);
	},

	sendSseNotification: (userId, notification) => {
		const client = clients[userId];
		if (client) {
			client.write(`data: ${JSON.stringify(notification)}\n\n`);
			console.log(`[SSE] Sent notification to user: ${userId}`);
		}
	},

	async createNotification(type, data) {
		let notification, emailDetails;
		const admin = await User.findOne({ role: "admin" }).lean();
		const { actor, recipient, order, review, reply, feedback, product, cancellationReason } = data;

		switch (type) {
			case "new_order":
				// Notify Admin
				if (admin) {
					const adminNotification = new Notification({
						recipient: admin._id,
						sender: actor._id,
						type: "new_order",
						message: `${actor.name} has placed a new order (#${order._id.toString().slice(-6)}).`,
						link: `/order/${order._id}`,
					});
					await adminNotification.save();
					await adminNotification.populate("sender", "name profilePicture");
					this.sendSseNotification(admin._id.toString(), adminNotification);

					await sendEmail(
						process.env.EMAIL_USER,
						`New Order Received: #${order._id.toString().slice(-6)}`,
						"adminNewOrderNotification",
						{ ORDER_ID: order._id.toString(), CUSTOMER_NAME: actor.name, CUSTOMER_EMAIL: actor.email, CTA_LINK: `https://kalyekart.app/secret-dashboard` }
					);
				}
				// Notify Customer
				const customerNotification = new Notification({
					recipient: actor._id,
					sender: admin ? admin._id : null,
					type: "order_confirmation",
					message: `Your order #${order._id.toString().slice(-6)} has been placed successfully!`,
					link: `/my-orders/${order._id}`,
				});
				await customerNotification.save();
				await customerNotification.populate("sender", "name profilePicture");
				this.sendSseNotification(actor._id.toString(), customerNotification);
				await sendEmail(
					actor.email,
					`Your KalyeKart Order #${order._id.toString().slice(-6)} is Confirmed!`,
					"orderConfirmation",
					{ NAME: actor.name, ORDER_ID: order._id.toString(), CTA_LINK: `https://kalyekart.app/my-orders/${order._id}` }
				);
				break;

			case "order_status_update":
				// Notify Customer
				notification = new Notification({
					recipient: recipient._id,
					sender: admin ? admin._id : null,
					type: "order_status_update",
					message: `The status of your order #${order._id.toString().slice(-6)} has been updated to ${order.status}.`,
					link: `/my-orders/${order._id}`,
				});
				await notification.save();
				await notification.populate("sender", "name profilePicture");
				this.sendSseNotification(recipient._id.toString(), notification);

				await sendEmail(
					recipient.email,
					`Your KalyeKart Order #${order._id.toString().slice(-6)} has been updated!`,
					"orderUpdate",
					{ NAME: recipient.name, ORDER_ID: order._id.toString(), NEW_STATUS: order.status, CTA_LINK: `https://kalyekart.app/my-orders/${order._id}` }
				);
				break;

			case "order_cancelled":
				// Notify Admin
				if (admin) {
					const adminNotification = new Notification({
						recipient: admin._id,
						sender: actor._id,
						type: "order_cancelled",
						message: `Order #${order._id.toString().slice(-6)} has been cancelled by ${actor.name}. Reason: ${cancellationReason}`,
						link: `/order/${order._id}`,
					});
					await adminNotification.save();
					await adminNotification.populate("sender", "name profilePicture");
					this.sendSseNotification(admin._id.toString(), adminNotification);
				}

				// Notify Customer
				const customerCancelNotification = new Notification({
					recipient: actor._id,
					sender: admin ? admin._id : null,
					type: "order_cancelled",
					message: `Your order #${order._id.toString().slice(-6)} has been successfully cancelled.`,
					link: `/my-orders`,
				});
				await customerCancelNotification.save();
				await customerCancelNotification.populate("sender", "name profilePicture");
				this.sendSseNotification(actor._id.toString(), customerCancelNotification);
				break;

			case "welcome":
				// Notify Customer
				const welcomeNotification = new Notification({
					recipient: actor._id,
					type: "welcome",
					message: "Welcome to KalyeKart! We're thrilled to have you.",
					link: "/",
				});
				await welcomeNotification.save();
				// No sender for welcome messages, so no need to populate
				this.sendSseNotification(actor._id.toString(), welcomeNotification);

				await sendEmail(actor.email, "Welcome to KalyeKart!", "welcome", {
					NAME: actor.name,
					CTA_LINK: "https://kalyekart.app",
				});
				break;

			case "new_feedback":
				// Notify Admin
				if (admin) {
					const adminNotification = new Notification({
						recipient: admin._id,
						sender: actor?._id,
						type: "new_feedback",
						message: `${actor?.name || "An anonymous user"} has submitted new feedback.`,
						link: `/secret-dashboard`, // Or a dedicated feedback page
					});
					await adminNotification.save();
					if (actor) await adminNotification.populate("sender", "name profilePicture");
					this.sendSseNotification(admin._id.toString(), adminNotification);

					await sendEmail(
						process.env.EMAIL_USER,
						`New Feedback Submission (Rating: ${feedback.rating}/5)`,
						"adminFeedbackNotification",
						{
							USER_NAME: actor?.name || "Anonymous",
							USER_EMAIL: actor?.email || "No email provided",
							RATING: feedback.rating,
							FEEDBACK_MESSAGE: feedback.feedback,
						}
					);
				}
				// Notify Customer
				if (actor) {
					const customerNotification = new Notification({
						recipient: actor._id,
						sender: admin ? admin._id : null,
						type: "feedback_confirmation",
						message: "Thank you for your feedback! We appreciate you helping us improve.",
						link: `/`,
					});
					await customerNotification.save();
					if (admin) await customerNotification.populate("sender", "name profilePicture");
					this.sendSseNotification(actor._id.toString(), customerNotification);

					await sendEmail(
						actor.email,
						"We've Received Your Feedback!",
						"userFeedbackConfirmation",
						{ NAME: actor.name, FEEDBACK_MESSAGE: feedback.feedback, CTA_LINK: "https://kalyekart.app" }
					);
				}
				break;

			case "new_reply":
				// Notify the author of the comment being replied to
				if (recipient && actor._id.toString() !== recipient._id.toString()) {
					notification = new Notification({
						recipient: recipient._id,
						sender: actor._id,
						type: "new_reply",
						message: `${actor.name} replied to your comment.`,
						link: `/product/${product._id}?review=${review._id}`,
					});
					await notification.save();
					await notification.populate("sender", "name profilePicture");
					this.sendSseNotification(recipient._id.toString(), notification);
				}
				break;

			default:
				console.warn(`Unknown notification type: ${type}`);
		}
	},
};

export default NotificationService;