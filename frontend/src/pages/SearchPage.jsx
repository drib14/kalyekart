import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

const SearchPage = () => {
	const query = useQuery();
	const searchTerm = query.get("q");
	const { searchProducts, searchResults, loading } = useProductStore();

	useEffect(() => {
		if (searchTerm) {
			searchProducts(searchTerm);
		}
	}, [searchTerm, searchProducts]);

	return (
		<div className='relative min-h-screen text-white overflow-hidden'>
			<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
				<h1 className='text-center text-4xl sm:text-5xl font-bold text-emerald-400 mb-4'>
					Search Results for &quot;{searchTerm}&quot;
				</h1>

				<motion.div
					className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					{loading ? (
						<p>Loading...</p>
					) : searchResults.length > 0 ? (
						searchResults.map((product) => <ProductCard key={product._id} product={product} />)
					) : (
						<div className='col-span-full text-center'>
							<h2 className='text-2xl font-semibold'>No results found</h2>
							<p className='text-gray-400'>Try a different search term.</p>
						</div>
					)}
				</motion.div>
			</div>
		</div>
	);
};

export default SearchPage;
