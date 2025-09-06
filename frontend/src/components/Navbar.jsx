import { ShoppingCart, UserPlus, LogIn, LogOut, Lock, Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useProductStore } from "../stores/useProductStore";
import { useEffect, useState } from "react";

const Navbar = () => {
	const { user, logout } = useUserStore();
	const isAdmin = user?.role === "admin";
	const { cart } = useCartStore();
	const { searchProducts, searchResults } = useProductStore();
	const [searchTerm, setSearchTerm] = useState("");
	const [isResultsVisible, setIsResultsVisible] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (searchTerm) {
			searchProducts(searchTerm);
			setIsResultsVisible(true);
		} else {
			setIsResultsVisible(false);
		}
	}, [searchTerm, searchProducts]);

	const handleSearchSubmit = (e) => {
		e.preventDefault();
		if (searchTerm) {
			navigate(`/search?q=${searchTerm}`);
			setIsResultsVisible(false);
		}
	};

	return (
		<header className='fixed top-0 left-0 w-full bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg z-40 transition-all duration-300 border-b border-emerald-800'>
			<div className='container mx-auto px-4 py-3'>
				<div className='flex flex-wrap justify-between items-center'>
					<Link to='/' className='text-2xl font-bold text-emerald-400 items-center space-x-2 flex'>
						KalyeKart
					</Link>

					<div className='relative flex-grow max-w-md mx-4'>
						<form onSubmit={handleSearchSubmit}>
							<input
								type='text'
								placeholder='Search for food...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='w-full px-4 py-2 text-white bg-gray-800 border border-emerald-700 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500'
							/>
							<button type='submit' className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white'>
								<Search size={20} />
							</button>
						</form>
						{isResultsVisible && (
							<div className='absolute mt-2 w-full bg-gray-800 border border-emerald-700 rounded-lg shadow-lg z-50'>
								{searchResults.length > 0 ? (
									searchResults.map((product) => (
										<Link
											key={product._id}
											to={`/product/${product._id}`} // Assuming a product page exists
											onClick={() => setIsResultsVisible(false)}
											className='flex items-center p-2 hover:bg-gray-700'
										>
											<img src={product.image} alt={product.name} className='w-10 h-10 rounded-md mr-2' />
											<span>{product.name}</span>
										</Link>
									))
								) : (
									<div className='p-2 text-center'>No results found</div>
								)}
							</div>
						)}
					</div>

					<nav className='flex flex-wrap items-center gap-4'>
						<Link
							to={"/"}
							className='text-gray-300 hover:text-emerald-400 transition duration-300
					 ease-in-out'
						>
							Home
						</Link>
						{user && (
							<Link
								to={"/cart"}
								className='relative group text-gray-300 hover:text-emerald-400 transition duration-300 
							ease-in-out'
							>
								<ShoppingCart className='inline-block mr-1 group-hover:text-emerald-400' size={20} />
								<span className='hidden sm:inline'>Cart</span>
								{cart.length > 0 && (
									<span
										className='absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5 
									text-xs group-hover:bg-emerald-400 transition duration-300 ease-in-out'
									>
										{cart.length}
									</span>
								)}
							</Link>
						)}
						{isAdmin && (
							<Link
								className='bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md font-medium
								 transition duration-300 ease-in-out flex items-center'
								to={"/secret-dashboard"}
							>
								<Lock className='inline-block mr-1' size={18} />
								<span className='hidden sm:inline'>Dashboard</span>
							</Link>
						)}

						{user ? (
							<button
								className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
						rounded-md flex items-center transition duration-300 ease-in-out'
								onClick={logout}
							>
								<LogOut size={18} />
								<span className='hidden sm:inline ml-2'>Log Out</span>
							</button>
						) : (
							<>
								<Link
									to={"/signup"}
									className='bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 
									rounded-md flex items-center transition duration-300 ease-in-out'
								>
									<UserPlus className='mr-2' size={18} />
									Sign Up
								</Link>
								<Link
									to={"/login"}
									className='bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 
									rounded-md flex items-center transition duration-300 ease-in-out'
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
