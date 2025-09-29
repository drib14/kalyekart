import { Home, ShoppingCart, ShoppingBag, Bell } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import { useNotifications } from "../lib/useNotifications";

const BottomNav = () => {
	const { cart } = useCartStore();
	const { unreadCount } = useNotifications();

	const navItems = [
		{ to: "/", icon: Home, label: "Home" },
		{ to: "/cart", icon: ShoppingCart, label: "Cart", badge: cart.length },
		{ to: "/my-orders", icon: ShoppingBag, label: "Orders" },
		{ to: "/notifications", icon: Bell, label: "Alerts", badge: unreadCount },
	];

	return (
		<nav className='fixed bottom-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md border-t border-emerald-800 sm:hidden z-40'>
			<div className='flex justify-around items-center h-16'>
				{navItems.map((item) => (
					<NavLink
						key={item.to}
						to={item.to}
						className={({ isActive }) =>
							`flex flex-col items-center justify-center text-xs w-full h-full relative ${
								isActive ? "text-emerald-400" : "text-gray-400"
							} hover:text-emerald-300 transition-colors`
						}
					>
						<item.icon className='h-6 w-6 mb-1' />
						<span>{item.label}</span>
						{item.badge > 0 && (
							<span className='absolute top-1 right-1/2 -translate-y-1/2 translate-x-4 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white'>
								{item.badge}
							</span>
						)}
					</NavLink>
				))}
			</div>
		</nav>
	);
};

export default BottomNav;