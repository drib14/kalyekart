import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "./axios";
import { useUserStore } from "../stores/useUserStore";

export const useNotifications = () => {
	const { user } = useUserStore();
	const queryClient = useQueryClient();
	const queryKey = useMemo(() => ["notifications", user?._id], [user?._id]);

	const { data: notifications = [] } = useQuery({
		queryKey,
		queryFn: async () => {
			const res = await axios.get("/notifications");
			return res.data;
		},
		enabled: !!user,
	});

	useEffect(() => {
		if (user) {
			const eventSource = new EventSource("/api/notifications/stream", { withCredentials: true });

			eventSource.onmessage = (event) => {
				const newNotification = JSON.parse(event.data);
				// Manually update the query cache to prepend the new notification
				queryClient.setQueryData(queryKey, (oldData) => {
					if (!oldData) return [newNotification];
					// Avoid adding duplicates
					if (oldData.some(n => n._id === newNotification._id)) {
						return oldData;
					}
					return [newNotification, ...oldData];
				});
			};

			eventSource.onerror = (error) => {
				console.error("EventSource failed:", error);
				eventSource.close();
			};

			return () => {
				eventSource.close();
			};
		}
	}, [user, queryClient, queryKey]);

	const unreadCount = notifications.filter((n) => !n.isRead).length;

	return { notifications, unreadCount };
};