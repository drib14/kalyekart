import { useEffect, useState } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import { categories } from "../data/categories";
import ProductDetailModal from "../components/ProductDetailModal";
import ProductsList from "../components/ProductsList";

const HomePage = () => {
	const { fetchAllProducts, products } = useProductStore();
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [activeCategory, setActiveCategory] = useState("All");

	useEffect(() => {
		fetchAllProducts();
	}, [fetchAllProducts]);

	const handleCardClick = (product) => {
		setSelectedProduct(product);
	};

	const handleCloseModal = () => {
		setSelectedProduct(null);
	};

	const filteredProducts =
		activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);

	const allCategories = [{ name: "All", imageUrl: "/logo.jpg", id: "all" }, ...categories];

	return (
		<>
			{selectedProduct && <ProductDetailModal product={selectedProduct} onClose={handleCloseModal} />}
			<div className='relative min-h-screen text-white overflow-hidden'>
				<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
					<h1 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>
						Explore Our Products
					</h1>
					<p className='text-center text-xl text-gray-300 mb-12'>
						Filter by category
					</p>

					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12'>
						{allCategories.map((category) => (
							<CategoryItem
								key={category.id}
								category={category}
								onClick={() => setActiveCategory(category.name)}
								isActive={activeCategory === category.name}
							/>
						))}
					</div>

					<ProductsList products={filteredProducts} onCardClick={handleCardClick} />
				</div>
			</div>
		</>
	);
};
export default HomePage;
