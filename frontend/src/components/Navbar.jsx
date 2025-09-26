import { ShoppingCart, UserPlus, LogIn, LogOut, Lock, User, Settings, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import Searchbar from "./Searchbar";
import { useCartStore } from "../stores/useCartStore";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const Navbar = () => {
	const { user, logout } = useUserStore();
	const isAdmin = user?.role === "admin";
	const { cart } = useCartStore();
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

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
						<Link to='/' className='text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'>
							Home
						</Link>
						{user && (
							<Link
								to={"/cart"}
								className='relative group text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out'
							>
								<ShoppingCart className='inline-block mr-1 group-hover:text-emerald-400' size={20} />
								<span className='hidden sm:inline'>Cart</span>
								{cart.length > 0 && (
									<span className='absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 text-xs group-hover:bg-emerald-400 transition duration-300 ease-in-out'>
										{cart.length}
									</span>
								)}
							</Link>
						)}
						{isAdmin && (
							<Link
								className='bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg font-medium transition duration-300 ease-in-out flex items-center'
								to={"/secret-dashboard"}
							>
								<Lock className='inline-block mr-1' size={18} />
								<span className='hidden sm:inline'>Dashboard</span>
							</Link>
						)}

						{user ? (
							<div className='relative' ref={dropdownRef}>
								<button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className='focus:outline-none'>
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
										<Link
											to={isAdmin ? "/profile/admin" : "/profile/customer"}
											className='flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700'
											onClick={() => setIsDropdownOpen(false)}
										>
											<User className='mr-2' size={16} /> Profile
										</Link>
										<Link
											to='/my-orders'
											className='flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700'
											onClick={() => setIsDropdownOpen(false)}
										>
											<ShoppingBag className='mr-2' size={16} /> My Orders
										</Link>
										<button
											onClick={() => {
												handleNotImplemented();
												setIsDropdownOpen(false);
											}}
											className='flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700'
										>
											<Settings className='mr-2' size={16} /> Settings
										</button>
										<button
											onClick={() => {
												logout();
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
						) : (
							<>
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
							</>
						)}
					</nav>
				</div>
			</div>
		</header>
	);
};
export default Navbar;
