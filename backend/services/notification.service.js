// A simple in-memory store for active client connections
const clients = {};

const NotificationService = {
	/**
	 * Adds a new client connection for a specific user.
	 * @param {string} userId - The ID of the user connecting.
	 * @param {object} res - The Express response object for the SSE connection.
	 */
	addClient: (userId, res) => {
		clients[userId] = res;
		console.log(`[SSE] Client connected for user: ${userId}`);
	},

	/**
	 * Removes a client connection for a specific user.
	 * @param {string} userId - The ID of the user disconnecting.
	 */
	removeClient: (userId) => {
		delete clients[userId];
		console.log(`[SSE] Client disconnected for user: ${userId}`);
	},

	/**
	 * Sends a new notification to a specific user if they are connected.
	 * @param {string} userId - The ID of the user to notify.
	 * @param {object} notification - The notification object to send.
	 */
	sendNotification: (userId, notification) => {
		const client = clients[userId];
		if (client) {
			// Ensure the notification is populated with sender details before sending
			const populatedNotification = {
				...notification.toObject(), // Convert Mongoose doc to plain object
				sender: notification.sender, // Assuming sender is already populated
			};
			client.write(`data: ${JSON.stringify(populatedNotification)}\n\n`);
			console.log(`[SSE] Sent notification to user: ${userId}`);
		}
	},
};

export default NotificationService;