import ProductCard from "./ProductCard";

const CustomerProductsGrid = ({ products, onCardClick }) => {
	if (!products || products.length === 0) {
		return <p className='text-center text-gray-400 mt-12'>No products found for this category.</p>;
	}

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
			{products.map((product) => (
				<ProductCard key={product._id} product={product} onCardClick={onCardClick} />
			))}
		</div>
	);
};

export default CustomerProductsGrid;
