import { useState, useEffect, useRef } from "react";
import { Search, X, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useSearchStore from "../stores/useSearchStore";

const Searchbar = () => {
	const navigate = useNavigate();
	const { query, setQuery, searchProducts, results, history, addToHistory, clearHistory } = useSearchStore();
	const [isFocused, setIsFocused] = useState(false);
	const searchRef = useRef(null);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (searchRef.current && !searchRef.current.contains(event.target)) {
				setIsFocused(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleInputChange = (e) => {
		const newQuery = e.target.value;
		setQuery(newQuery);
		if (newQuery.length > 2) {
			searchProducts(newQuery);
		}
	};

	const handleSearch = (e) => {
		e.preventDefault();
		if (!query.trim()) return;
		addToHistory(query);
		setIsFocused(false);
		navigate(`/search?q=${encodeURIComponent(query)}`);
	};

	const handleHistoryClick = (searchQuery) => {
		setQuery(searchQuery);
		addToHistory(searchQuery);
		setIsFocused(false);
		navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
	};

	return (
		<div className='relative w-full max-w-md' ref={searchRef}>
			<form onSubmit={handleSearch} className='relative'>
				<input
					type='text'
					value={query}
					onChange={handleInputChange}
					onFocus={() => setIsFocused(true)}
					placeholder='Search for products...'
					className='w-full px-4 py-2 pr-10 text-white bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500'
				/>
				<button type='submit' className='absolute inset-y-0 right-0 flex items-center pr-3'>
					<Search className='w-5 h-5 text-gray-400' />
				</button>
			</form>

			{isFocused && (
				<div className='absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg'>
					{query.length === 0 && history.length > 0 && (
						<div>
							<div className='flex justify-between items-center px-4 py-2'>
								<h3 className='text-sm font-semibold text-gray-400'>Recent Searches</h3>
								<button onClick={clearHistory} className='text-xs text-emerald-400 hover:underline'>
									Clear
								</button>
							</div>
							<ul>
								{history.map((item, index) => (
									<li
										key={index}
										onClick={() => handleHistoryClick(item)}
										className='flex items-center px-4 py-2 cursor-pointer hover:bg-gray-700'
									>
										<History className='w-4 h-4 mr-2 text-gray-500' />
										<span>{item}</span>
									</li>
								))}
							</ul>
						</div>
					)}

					{query.length > 2 && results.length > 0 && (
						<div>
							<h3 className='text-sm font-semibold text-gray-400 px-4 py-2'>Products</h3>
							<ul>
								{results.slice(0, 5).map((product) => (
									<li
										key={product._id}
										onClick={() => {
											setIsFocused(false);
											navigate(`/product/${product._id}`);
										}}
										className='flex items-start p-4 cursor-pointer hover:bg-gray-700 transition-colors duration-200'
									>
										<img
											src={product.image}
											alt={product.name}
											className='w-16 h-16 object-cover rounded-md mr-4'
										/>
										<div className='flex-1'>
											<p className='font-bold text-white'>{product.name}</p>
											<p className='text-sm text-emerald-400 mb-1'>
												₱{product.price.toFixed(2)}
											</p>
											<p className='text-xs text-gray-400 custom-line-clamp-2'>
												{product.description}
											</p>
										</div>
									</li>
								))}
							</ul>
						</div>
					)}

					{query.length > 2 && results.length === 0 && (
						<div className='p-4 text-center text-gray-500'>
							<p>No products found for "{query}"</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default Searchbar;
