import { useEffect, useState } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import { categories } from "../data/categories";
import ProductDetailModal from "../components/ProductDetailModal";

const HomePage = () => {
	const { fetchFeaturedProducts, products, isLoading } = useProductStore();
	const [selectedProduct, setSelectedProduct] = useState(null);

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);

	const handleCardClick = (product) => {
		setSelectedProduct(product);
	};

	const handleCloseModal = () => {
		setSelectedProduct(null);
	};

	return (
		<>
			{selectedProduct && <ProductDetailModal product={selectedProduct} onClose={handleCloseModal} />}
			<div className='relative min-h-screen text-white overflow-hidden'>
				<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
					<h1 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>
						Explore Our Categories
					</h1>
					<p className='text-center text-xl text-gray-300 mb-12'>
						Explore our delicious menu options
					</p>

					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
						{categories.map((category) => (
							<CategoryItem category={category} key={category.name} />
						))}
					</div>

					{!isLoading && products.length > 0 && (
						<FeaturedProducts featuredProducts={products} onCardClick={handleCardClick} />
					)}
				</div>
			</div>
		</>
	);
};
export default HomePage;
