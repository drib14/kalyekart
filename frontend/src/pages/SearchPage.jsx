import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useSearchStore from "../stores/useSearchStore";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";

const useQuery = () => {
	return new URLSearchParams(useLocation().search);
};

const SearchPage = () => {
	const query = useQuery().get("q");
	const { results, isLoading, error, searchProducts, addToHistory } = useSearchStore();
	const navigate = useNavigate();

	useEffect(() => {
		if (query) {
			searchProducts(query);
			addToHistory(query);
		}
	}, [query, searchProducts, addToHistory]);

	const handleCardClick = (product) => {
		navigate(`/product/${product._id}`);
	};

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold text-white mb-6'>
				Search Results for: <span className='text-emerald-400'>"{query}"</span>
			</h1>

			{isLoading && <LoadingSpinner />}
			{error && <p className='text-red-500 text-center'>{error}</p>}

			{!isLoading && !error && (
				<>
					{results.length > 0 ? (
						<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
							{results.map((product) => (
								<ProductCard key={product._id} product={product} onCardClick={handleCardClick} />
							))}
						</div>
					) : (
						<p className='text-gray-400 text-center text-lg'>
							No products found matching your search. Try a different keyword.
						</p>
					)}
				</>
			)}
		</div>
	);
};

export default SearchPage;
