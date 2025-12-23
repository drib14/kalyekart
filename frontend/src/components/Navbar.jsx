import {
	ShoppingCart,
	UserPlus,
	LogIn,
	LogOut,
	Lock,
	User,
	Settings,
	MessageSquare,
	Heart,
	Ticket,
	Gift,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import Searchbar from "./Searchbar";
import { useCartStore } from "../stores/useCartStore";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import NotificationBell from "./NotificationBell";
import NotificationPanel from "./NotificationPanel";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { useNotifications } from "../lib/useNotifications";

const Navbar = () => {
	const { user, logout } = useUserStore();
	const isAdmin = user?.role === "admin";
	const isDriver = user?.role === "driver";
	const isCustomer = user?.role === "customer";
	const { cart } = useCartStore();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
	const dropdownRef = useRef(null);
	const notificationRef = useRef(null);
	const prevIsNotificationsOpenRef = useRef(isNotificationsOpen);

	const { unreadCount } = useNotifications();
	const queryClient = useQueryClient();

	const markAllAsReadMutation = useMutation({
		mutationFn: () => axios.put("/notifications/read-all"),
		onSuccess: () => {
			// Invalidate queries to refetch notifications and update the count
			// useNotifications uses ["notifications", user._id] as the key
			// We use a broad match ["notifications"] to ensure we catch it even if user._id is slightly different (e.g. string vs object)
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
			console.log("All notifications marked as read successfully.");
		},
		onError: (error) => {
			console.error("Failed to mark notifications as read:", error);
		},
	});

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsDropdownOpen(false);
			}
			if (notificationRef.current && !notificationRef.current.contains(event.target)) {
				setIsNotificationsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleNotificationClick = () => {
		const isOpen = !isNotificationsOpen;
		setIsNotificationsOpen(isOpen);

		if (isOpen && unreadCount > 0) {
			markAllAsReadMutation.mutate();
		}
	};

	const handleNotImplemented = () => {
		toast.info("This feature is not yet implemented.");
	};

	return (
		<header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800'>
			<div className='container mx-auto px-4 py-3'>
				<div className='flex justify-between items-center'>
					<Link to='/' className='flex items-center gap-2'>
						<img src='/logo.jpg' alt='KalyeKart Logo' className='w-10 h-10 rounded-full' />
						<span className='text-2xl font-bold text-emerald-400 hidden sm:block'>KalyeKart</span>
					</Link>

					<div className='flex-1 flex justify-center px-4'>
						<Searchbar />
					</div>

					<nav className='flex items-center gap-4'>
						{/* Desktop Navigation Links - Hidden on small screens */}
						<div className='hidden sm:flex items-center gap-4'>
							<Link
								to='/'
								className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'
							>
								Home
							</Link>
							{user && (
								<Link
									to={"/cart"}
									className='relative group text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'
								>
									<ShoppingCart className='inline-block mr-1 group-hover:text-emerald-400' size={20} />
									<span>Cart</span>
									{cart.length > 0 && (
										<span className='absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs group-hover:bg-emerald-400 transition duration-300 ease-in-out'>
											{cart.length}
										</span>
									)}
								</Link>
							)}
							{user && (
								<Link
									to='/my-orders'
									className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'
								>
									My Orders
								</Link>
							)}
						</div>

						{user ? (
							<>
								<div className='relative' ref={notificationRef}>
									<NotificationBell onClick={handleNotificationClick} />
									{isNotificationsOpen && (
										<NotificationPanel onClose={() => setIsNotificationsOpen(false)} />
									)}
								</div>
								<div className='relative' ref={dropdownRef}>
									<button
										onClick={() => setIsDropdownOpen(!isDropdownOpen)}
										className='focus:outline-none'
									>
										{user.profilePicture ? (
											<img
												src={user.profilePicture}
												alt='Profile'
												className='w-10 h-10 rounded-full object-cover border-2 border-emerald-500'
											/>
										) : (
											<User className='w-10 h-10 rounded-full bg-gray-700 text-white p-2' />
										)}
									</button>
									{isDropdownOpen && (
										<div className='absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg py-1 z-50'>
											{/* Dashboard Links */}
											{isAdmin && (
												<Link
													className='flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700'
													to={"/secret-dashboard"}
													onClick={() => setIsDropdownOpen(false)}
												>
													<Lock className='mr-2' size={16} />
													Admin Dashboard
												</Link>
											)}
											{isDriver && (
												<Link
													className='flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700'
													to={"/driver/dashboard"}
													onClick={() => setIsDropdownOpen(false)}
												>
													<Lock className='mr-2' size={16} />
													Driver Panel
												</Link>
											)}

											<Link
												to={isAdmin ? "/profile/admin" : "/profile/customer"}
												className='flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700'
												onClick={() => setIsDropdownOpen(false)}
											>
												<User className='mr-2' size={16} /> Profile
											</Link>

											{/* Customer Only Links */}
											{isCustomer && (
												<>
													<Link
														to='/my-reviews'
														className='flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700'
														onClick={() => setIsDropdownOpen(false)}
													>
														<MessageSquare className='mr-2' size={16} /> My Reviews
													</Link>
													<Link
														to='/favorites'
														className='flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700'
														onClick={() => setIsDropdownOpen(false)}
													>
														<Heart className='mr-2' size={16} /> Favorites
													</Link>
													<Link
														to='/my-discounts'
														className='flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700'
														onClick={() => setIsDropdownOpen(false)}
													>
														<Ticket className='mr-2' size={16} /> My Discounts
													</Link>
													<Link
														to='/my-rewards'
														className='flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700'
														onClick={() => setIsDropdownOpen(false)}
													>
														<Gift className='mr-2' size={16} /> My Rewards
													</Link>
												</>
											)}
											<Link
												to={isAdmin ? "/admin/settings" : "/settings"}
												className='flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700'
												onClick={() => setIsDropdownOpen(false)}
											>
												<Settings className='mr-2' size={16} /> Settings
											</Link>
											<button
												onClick={() => {
													logout();
													// Ensure Google Auth state is also cleared if they used it
													import("@react-oauth/google").then(({ googleLogout }) => googleLogout());
													toast.success("Logged out successfully");
													setIsDropdownOpen(false);
												}}
												className='flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700'
											>
												<LogOut className='mr-2' size={16} /> Logout
											</button>
										</div>
									)}
								</div>
							</>
						) : (
							<div className='flex items-center gap-4'>
								<Link
									to={"/signup"}
									className='bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg flex items-center transition duration-300 ease-in-out'
								>
									<UserPlus className='mr-2' size={18} />
									Sign Up
								</Link>
								<Link
									to={"/login"}
									className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg flex items-center transition duration-300 ease-in-out'
								>
									<LogIn className='mr-2' size={18} />
									Login
								</Link>
							</div>
						)}
					</nav>
				</div>
			</div>
		</header>
	);
};
export default Navbar;