import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

const CustomerProductsGrid = ({ products, onCardClick }) => {
	const getScreenBasedLimit = () => (window.innerWidth >= 1024 ? 10 : 8);

	const [visibleCount, setVisibleCount] = useState(getScreenBasedLimit());

	// Reset visible count when products change (e.g., category filter changes)
	useEffect(() => {
		setVisibleCount(getScreenBasedLimit());
	}, [products]);

	if (!products || products.length === 0) {
		return <p className='text-center text-gray-400 mt-12'>No products found for this category.</p>;
	}

	const handleShowMore = () => {
		setVisibleCount((prevCount) => prevCount + getScreenBasedLimit());
	};

	const displayedProducts = products.slice(0, visibleCount);
	const hasMoreProducts = visibleCount < products.length;

	return (
		<>
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
				{displayedProducts.map((product) => (
					<ProductCard key={product._id} product={product} onCardClick={onCardClick} />
				))}
			</div>
			{hasMoreProducts && (
				<div className='text-center mt-12'>
					<button
						onClick={handleShowMore}
						className='bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-emerald-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50'
					>
						Show More
					</button>
				</div>
			)}
		</>
	);
};

export default CustomerProductsGrid;
