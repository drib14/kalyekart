import { Home, ShoppingCart, ShoppingBag, LayoutDashboard } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";

const BottomNav = () => {
	const { cart } = useCartStore();
	const { user } = useUserStore();
	const isAdmin = user?.role === "admin";

	const baseNavItems = [
		{ to: "/", icon: Home, label: "Home" },
		{ to: "/cart", icon: ShoppingCart, label: "Cart", badge: cart.length },
		{ to: "/my-orders", icon: ShoppingBag, label: "Orders" },
	];

	const adminNavItems = [
		...baseNavItems.slice(0, 1), // Home
		{ to: "/secret-dashboard", icon: LayoutDashboard, label: "Dashboard" },
		...baseNavItems.slice(1), // Cart, Orders
	];

	const navItems = isAdmin ? adminNavItems : baseNavItems;

	// The dashboard icon for admin should not have a badge, so we can filter it out
	if (isAdmin) {
		// A bit of a hacky way to place the dashboard icon second
		const home = { to: "/", icon: Home, label: "Home" };
		const dashboard = { to: "/secret-dashboard", icon: LayoutDashboard, label: "Dashboard" };
		const cartItem = { to: "/cart", icon: ShoppingCart, label: "Cart", badge: cart.length };
		const orders = { to: "/my-orders", icon: ShoppingBag, label: "Orders" };
		navItems.splice(0, navItems.length, home, dashboard, cartItem, orders);
	}

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