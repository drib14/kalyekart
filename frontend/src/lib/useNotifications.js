import { useQuery } from "@tanstack/react-query";
import axios from "./axios";
import { useUserStore } from "../stores/useUserStore";

export const useNotifications = () => {
	const { user } = useUserStore();

	const { data: notifications, ...queryInfo } = useQuery({
		queryKey: ["notifications", user?._id],
		queryFn: async () => {
			const res = await axios.get("/notifications");
			return res.data;
		},
		enabled: !!user,
		refetchInterval: 60000,
	});

	// Safely calculate unread count, ensuring notifications is an array
	const unreadCount = Array.isArray(notifications)
		? notifications.filter((n) => !n.isRead).length
		: 0;

	// Ensure the returned notifications is always an array
	const safeNotifications = Array.isArray(notifications) ? notifications : [];

	return { notifications: safeNotifications, unreadCount, ...queryInfo };
};