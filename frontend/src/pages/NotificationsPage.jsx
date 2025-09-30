import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { User } from "lucide-react";

const NotificationsPage = () => {
	const { user } = useUserStore();
	const queryClient = useQueryClient();

	const {
		data: notifications,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["notifications", user?._id],
		queryFn: async () => {
			const res = await axios.get("/notifications");
			return res.data;
		},
		enabled: !!user,
	});

	const markAllAsReadMutation = useMutation({
		mutationFn: () => axios.put("/notifications/read-all"),
		onSuccess: () => {
			toast.success("All notifications marked as read");
			queryClient.invalidateQueries(["notifications"]);
		},
		onError: () => {
			toast.error("Failed to mark all notifications as read");
		},
	});

	if (isLoading) return <LoadingSpinner />;
	if (isError) return <div>Error: {error.message}</div>;

	// Ensure notifications is always an array to prevent crashes
	const safeNotifications = Array.isArray(notifications) ? notifications : [];

	return (
		<main className='container my-10'>
			<div className='max-w-4xl mx-auto'>
				<div className='flex justify-between items-center mb-8'>
					<h1 className='text-3xl font-extrabold text-emerald-400'>Notifications</h1>
					<button
						onClick={() => markAllAsReadMutation.mutate()}
						className='text-sm text-emerald-400 hover:underline'
						disabled={safeNotifications.every((n) => n.isRead)}
					>
						Mark all as read
					</button>
				</div>
				<div className='space-y-4'>
					{safeNotifications.length > 0 ? (
						safeNotifications.map((notification) => (
							<Link
								key={notification._id}
								to={notification.link}
								className={`flex items-start gap-4 p-6 rounded-lg shadow-lg transition-colors duration-200 ${
									notification.isRead
										? "bg-gray-800 opacity-60"
										: "bg-gray-700 hover:bg-gray-600"
								}`}
							>
								{notification.sender?.profilePicture ? (
									<img
										src={notification.sender.profilePicture}
										alt={notification.sender.name}
										className='w-10 h-10 rounded-full object-cover'
									/>
								) : (
									<User className='w-10 h-10 rounded-full bg-gray-700 text-white p-2' />
								)}
								<div className='flex-1'>
									<p className='text-white'>
										{notification.sender && (
											<span className='font-bold'>{notification.sender.name} </span>
										)}
										{notification.message}
									</p>
									<p className='text-sm text-gray-400 mt-2'>
										{format(new Date(notification.createdAt), "MMMM d, yyyy 'at' h:mm a")}
									</p>
								</div>
							</Link>
						))
					) : (
						<div className='text-center py-16'>
							<p className='text-gray-400'>You have no notifications yet.</p>
						</div>
					)}
				</div>
			</div>
		</main>
	);
};

export default NotificationsPage;