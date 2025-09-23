import { useEffect, useState } from "react";
import { useProductStore } from "../stores/useProductStore";
import { categories } from "../data/categories";
import ProductDetailModal from "../components/ProductDetailModal";
import CustomerProductsGrid from "../components/CustomerProductsGrid";
import CategoryTab from "../components/CategoryTab";

const HomePage = () => {
	const { fetchAllProducts, products } = useProductStore();
	const [selectedProduct, setSelectedProduct] = useState(null);
	const [activeCategory, setActiveCategory] = useState("all");

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
		activeCategory === "all" ? products : products.filter((p) => p.category === activeCategory);

	const allCategories = [{ name: "All", id: "all", imageUrl: "/logo.jpg" }, ...categories];

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

					<div className='flex items-center justify-start lg:justify-center gap-2 mb-12 overflow-x-auto pb-4'>
						{allCategories.map((category) => (
							<CategoryTab
								key={category.id}
								category={category}
								onClick={() => setActiveCategory(category.id)}
								isActive={activeCategory === category.id}
							/>
						))}
					</div>

					<CustomerProductsGrid products={filteredProducts} onCardClick={handleCardClick} />
				</div>
			</div>
		</>
	);
};
export default HomePage;
