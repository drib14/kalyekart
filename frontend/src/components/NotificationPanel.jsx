import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "../lib/useNotifications";
import { User } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const NotificationPanel = ({ onClose }) => {
	const { notifications } = useNotifications();
	const { user } = useUserStore();
	const queryClient = useQueryClient();
	const queryKey = ["notifications", user?._id];

	const markAsReadMutation = useMutation({
		mutationFn: (notificationId) => axios.put(`/notifications/${notificationId}/read`),
		onMutate: async (notificationId) => {
			// Cancel any outgoing refetches so they don't overwrite our optimistic update
			await queryClient.cancelQueries({ queryKey });

			// Snapshot the previous value
			const previousNotifications = queryClient.getQueryData(queryKey);

			// Optimistically update to the new value
			queryClient.setQueryData(queryKey, (oldData = []) =>
				oldData.map((notification) =>
					notification._id === notificationId
						? { ...notification, isRead: true }
						: notification
				)
			);

			// Return a context object with the snapshotted value
			return { previousNotifications };
		},
		onError: (err, notificationId, context) => {
			// If the mutation fails, use the context we returned from onMutate to roll back
			if (context?.previousNotifications) {
				queryClient.setQueryData(queryKey, context.previousNotifications);
			}
		},
		onSettled: () => {
			// Always refetch after error or success to ensure server state
			queryClient.invalidateQueries({ queryKey });
		},
	});

	const handleNotificationClick = (notification) => {
		if (!notification.isRead) {
			markAsReadMutation.mutate(notification._id);
		}
		onClose();
	};

	return (
		<div className='absolute top-16 right-0 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50'>
			<div className='p-4 border-b border-gray-700'>
				<h3 className='font-bold text-white'>Notifications</h3>
			</div>
			<div className='max-h-96 overflow-y-auto'>
				{notifications && notifications.length > 0 ? (
					notifications.map((notification) => (
						<Link
							key={notification._id}
							to={notification.link}
							onClick={() => handleNotificationClick(notification)}
							className={`flex items-start gap-3 p-4 border-b border-gray-700 hover:bg-gray-700 ${
								notification.isRead ? "opacity-60" : ""
							}`}
						>
							{notification.sender?.profilePicture ? (
								<img
									src={notification.sender.profilePicture}
									alt={notification.sender.name}
									className='w-8 h-8 rounded-full object-cover'
								/>
							) : (
								<User className='w-8 h-8 rounded-full bg-gray-700 text-white p-1' />
							)}
							<div className='flex-1'>
								<p className='text-sm text-white'>
									{notification.sender && (
										<span className='font-bold'>{notification.sender.name} </span>
									)}
									{notification.message}
								</p>
								<p className='text-xs text-gray-400 mt-1'>
									{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
								</p>
							</div>
						</Link>
					))
				) : (
					<div className='p-4 text-center text-gray-400'>You have no new notifications.</div>
				)}
			</div>
			<div className='p-2 text-center border-t border-gray-700'>
				<Link to='/notifications' onClick={onClose} className='text-sm text-emerald-400 hover:underline'>
					View all notifications
				</Link>
			</div>
		</div>
	);
};

export default NotificationPanel;