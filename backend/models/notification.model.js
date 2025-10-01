import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
	{
		recipient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		type: {
			type: String,
			required: true,
			enum: [
				"new_order",
				"order_status_update",
				"order_cancelled",
				"refund_request",
				"refund_status_update",
				"new_feedback",
				"feedback_confirmation",
				"welcome",
				"new_review",
				"review_confirmation",
				"new_like",
				"new_reply",
			],
		},
		message: {
			type: String,
			required: true,
		},
		link: {
			type: String,
			required: true,
		},
		isRead: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;