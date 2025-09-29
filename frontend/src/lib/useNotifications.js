import { useQuery } from "@tanstack/react-query";
import axios from "./axios";
import { useUserStore } from "../stores/useUserStore";

export const useNotifications = () => {
	const { user } = useUserStore();

	const { data: notifications, ...queryInfo } = useQuery({
		queryKey: ["notifications", user?._id],
		queryFn: async () => {
			const res = await axios.get("/api/notifications");
			return res.data;
		},
		enabled: !!user,
		refetchInterval: 60000,
	});

	const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

	return { notifications: notifications || [], unreadCount, ...queryInfo };
};