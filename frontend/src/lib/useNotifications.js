import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "./axios";
import { useUserStore } from "../stores/useUserStore";

export const useNotifications = () => {
	const { user } = useUserStore();
	const queryClient = useQueryClient();
	const [notifications, setNotifications] = useState([]);

	// Fetch initial notifications on mount
	useEffect(() => {
		if (user) {
			axios.get("/notifications").then((res) => {
				setNotifications(res.data);
			});
		}
	}, [user]);

	// Set up real-time connection for new notifications
	useEffect(() => {
		if (user) {
			const eventSource = new EventSource("/api/notifications/stream", { withCredentials: true });

			eventSource.onmessage = (event) => {
				const newNotification = JSON.parse(event.data);
				// Add the new notification to the top of the list
				setNotifications((prevNotifications) => [newNotification, ...prevNotifications]);
				// Optional: Invalidate queries if you want other parts of the app to be aware of the change globally
				queryClient.invalidateQueries({ queryKey: ["notifications"] });
			};

			eventSource.onerror = (error) => {
				console.error("EventSource failed:", error);
				eventSource.close();
			};

			// Clean up the connection when the component unmounts
			return () => {
				eventSource.close();
			};
		}
	}, [user, queryClient]);

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	return { notifications, unreadCount };
};