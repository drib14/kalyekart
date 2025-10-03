import { Link, useLocation } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { Home, ShoppingCart, ClipboardList, User } from "lucide-react"; // Replaced Bell with ClipboardList

const BottomNav = () => {
	const { pathname } = useLocation();
	const { cart } = useCartStore();
	const { user } = useUserStore();

	const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

	const getProfileLink = () => {
		if (!user) return "/login";
		return user.role === "admin" ? "/profile/admin" : "/profile/customer";
	};

	const links = [
		{ href: "/", icon: <Home size={24} />, label: "Home" },
		{
			href: "/cart",
			icon: (
				<div className='relative'>
					<ShoppingCart size={24} />
					{totalItems > 0 && (
						<span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
							{totalItems}
						</span>
					)}
				</div>
			),
			label: "Cart",
		},
		// Replaced Notifications with My Orders
		{ href: "/my-orders", icon: <ClipboardList size={24} />, label: "My Orders" },
		{ href: getProfileLink(), icon: <User size={24} />, label: "Profile" },
	];

	return (
		<div className='md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around items-center py-2 z-50'>
			{links.map(({ href, icon, label }) => {
				const isActive = pathname === href;
				return (
					<Link
						key={href}
						to={href}
						className={`flex flex-col items-center justify-center w-full ${
							isActive ? "text-emerald-400" : "text-gray-400"
						} hover:text-emerald-300 transition-colors`}
					>
						{icon}
						<span className='text-xs mt-1'>{label}</span>
					</Link>
				);
			})}
		</div>
	);
};

export default BottomNav;