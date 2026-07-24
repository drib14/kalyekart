import Notification from "../models/notification.model.js";
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

	async sendPushNotification(userId, title, body, link) {
		// Firebase push notifications removed
	},

	async createNotification(type, data) {
		let notification;
		const adminUser = await User.findOne({ role: "admin" }).lean();
		const { actor, recipient, order, review, reply, feedback, product, cancellationReason, products } = data;

		try {
			switch (type) {
				case "new_order":
					const orderItemsHtml = products
						.map(
							(item) => `
							<tr>
								<td>${item.name}</td>
								<td>${item.quantity}</td>
								<td>₱${item.price.toFixed(2)}</td>
							</tr>`
						)
						.join("");

					// In-app notification for admin (if admin exists)
					if (adminUser) {
						const adminNotification = new Notification({
							recipient: adminUser._id,
							sender: actor._id,
							type: "new_order",
							message: `${actor.name} has placed a new order (#${order._id.toString().slice(-6)}).`,
							link: `/order/${order._id}`,
						});
						await adminNotification.save();
						await adminNotification.populate("sender", "name profilePicture");
						this.sendSseNotification(adminUser._id.toString(), adminNotification);
						this.sendPushNotification(
							adminUser._id.toString(),
							"New Order Received!",
							adminNotification.message,
							adminNotification.link
						);
					}

					// Customer in-app notification
					const customerNotification = new Notification({
						recipient: actor._id,
						sender: adminUser ? adminUser._id : null,
						type: "order_confirmation",
						message: `Your order #${order._id.toString().slice(-6)} has been placed successfully!`,
						link: `/order/${order._id}`,
					});
					await customerNotification.save();
					await customerNotification.populate("sender", "name profilePicture");
					this.sendSseNotification(actor._id.toString(), customerNotification);
					this.sendPushNotification(
						actor._id.toString(),
						"Order Confirmed!",
						customerNotification.message,
						customerNotification.link
					);
					break;

				case "order_status_update":
					notification = new Notification({
						recipient: recipient._id,
						sender: adminUser ? adminUser._id : null,
						type: "order_status_update",
						message: `The status of your order #${order._id.toString().slice(-6)} has been updated to ${order.status}.`,
						link: `/order/${order._id}`,
					});
					await notification.save();
					await notification.populate("sender", "name profilePicture");
					this.sendSseNotification(recipient._id.toString(), notification);
					this.sendPushNotification(
						recipient._id.toString(),
						"Order Status Updated",
						notification.message,
						notification.link
					);
					break;

				case "order_cancelled":
					if (adminUser) {
						const adminNotification = new Notification({
							recipient: adminUser._id,
							sender: actor._id,
							type: "order_cancelled",
							message: `Order #${order._id.toString().slice(-6)} has been cancelled by ${actor.name}. Reason: ${cancellationReason}`,
							link: `/order/${order._id}`,
						});
						await adminNotification.save();
						await adminNotification.populate("sender", "name profilePicture");
						this.sendSseNotification(adminUser._id.toString(), adminNotification);
						this.sendPushNotification(
							adminUser._id.toString(),
							"Order Cancelled",
							adminNotification.message,
							adminNotification.link
						);
					}
					const customerCancelNotification = new Notification({
						recipient: actor._id,
						sender: adminUser ? adminUser._id : null,
						type: "order_cancelled",
						message: `Your order #${order._id.toString().slice(-6)} has been successfully cancelled.`,
						link: `/order/${order._id}`,
					});
					await customerCancelNotification.save();
					await customerCancelNotification.populate("sender", "name profilePicture");
					this.sendSseNotification(actor._id.toString(), customerCancelNotification);
					this.sendPushNotification(
						actor._id.toString(),
						"Order Cancelled",
						customerCancelNotification.message,
						customerCancelNotification.link
					);
					break;

				case "welcome":
					const welcomeNotification = new Notification({
						recipient: actor._id,
						type: "welcome",
						message: "Welcome to KalyeKart! We're thrilled to have you.",
						link: "/",
					});
					await welcomeNotification.save();
					this.sendSseNotification(actor._id.toString(), welcomeNotification);
					this.sendPushNotification(
						actor._id.toString(),
						"Welcome to KalyeKart!",
						welcomeNotification.message,
						welcomeNotification.link
					);
					break;

				case "new_feedback":
					if (adminUser) {
						const adminNotification = new Notification({
							recipient: adminUser._id,
							sender: actor ? actor._id : null,
							type: "new_feedback",
							message: `${actor?.name || "An anonymous user"} has submitted new feedback.`,
							link: `/secret-dashboard`,
						});
						await adminNotification.save();
						if (actor) await adminNotification.populate("sender", "name profilePicture");
						this.sendSseNotification(adminUser._id.toString(), adminNotification);
						this.sendPushNotification(
							adminUser._id.toString(),
							"New Feedback Received",
							adminNotification.message,
							adminNotification.link
						);
					}
					if (actor && actor._id) {
						const customerNotification = new Notification({
							recipient: actor._id,
							sender: adminUser ? adminUser._id : null,
							type: "feedback_confirmation",
							message: "Thank you for your feedback! We appreciate you helping us improve.",
							link: `/`,
						});
						await customerNotification.save();
						if (adminUser) await customerNotification.populate("sender", "name profilePicture");
						this.sendSseNotification(actor._id.toString(), customerNotification);
						this.sendPushNotification(
							actor._id.toString(),
							"Feedback Received",
							customerNotification.message,
							customerNotification.link
						);
					}
					break;

				case "new_review":
					if (adminUser) {
						const adminNotification = new Notification({
							recipient: adminUser._id,
							sender: actor._id,
							type: "new_review",
							message: `${actor.name} left a new review on ${product.name}.`,
							link: `/product/${product._id}?review=${review._id}`,
						});
						await adminNotification.save();
						await adminNotification.populate("sender", "name profilePicture");
						this.sendSseNotification(adminUser._id.toString(), adminNotification);
						this.sendPushNotification(
							adminUser._id.toString(),
							"New Review Submitted",
							adminNotification.message,
							adminNotification.link
						);
					}
					break;

				case "new_like":
					if (recipient && actor._id.toString() !== recipient._id.toString()) {
						notification = new Notification({
							recipient: recipient._id,
							sender: actor._id,
							type: "new_like",
							message: `${actor.name} liked your ${data.likedEntityType || 'comment'}.`,
							link: `/product/${product._id}?review=${review._id}`,
						});
						await notification.save();
						await notification.populate("sender", "name profilePicture");
						this.sendSseNotification(recipient._id.toString(), notification);
						this.sendPushNotification(
							recipient._id.toString(),
							"Someone Liked Your Comment!",
							notification.message,
							notification.link
						);
					}
					break;

				case "new_reply":
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
						this.sendPushNotification(
							recipient._id.toString(),
							"You Have a New Reply",
							notification.message,
							notification.link
						);
					}
					break;

				default:
					console.warn(`Unknown notification type: ${type}`);
			}
		} catch (error) {
			console.error(`Error creating notification of type ${type}:`, error);
		}
	},
};

export default NotificationService;