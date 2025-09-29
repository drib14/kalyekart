import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";

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

	return (
		<main className='container my-10'>
			<div className='max-w-4xl mx-auto'>
				<div className='flex justify-between items-center mb-8'>
					<h1 className='text-3xl font-extrabold text-emerald-400'>Notifications</h1>
					<button
						onClick={() => markAllAsReadMutation.mutate()}
						className='text-sm text-emerald-400 hover:underline'
						disabled={notifications.every((n) => n.isRead)}
					>
						Mark all as read
					</button>
				</div>
				<div className='space-y-4'>
					{notifications && notifications.length > 0 ? (
						notifications.map((notification) => (
							<Link
								key={notification._id}
								to={notification.link}
								className={`block p-6 rounded-lg shadow-lg transition-colors duration-200 ${
									notification.isRead
										? "bg-gray-800 opacity-60"
										: "bg-gray-700 hover:bg-gray-600"
								}`}
							>
								<p className='text-white'>{notification.message}</p>
								<p className='text-sm text-gray-400 mt-2'>
									{format(new Date(notification.createdAt), "MMMM d, yyyy 'at' h:mm a")}
								</p>
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