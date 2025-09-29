import { Bell } from "lucide-react";
import { useNotifications } from "../lib/useNotifications";

const NotificationBell = ({ onClick }) => {
	const { unreadCount } = useNotifications();

	return (
		<button onClick={onClick} className='relative text-gray-300 hover:text-white'>
			<Bell className='h-6 w-6' />
			{unreadCount > 0 && (
				<span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
					{unreadCount}
				</span>
			)}
		</button>
	);
};

export default NotificationBell;