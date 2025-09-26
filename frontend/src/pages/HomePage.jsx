import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { categories } from "../data/categories";
import CustomerProductsGrid from "../components/CustomerProductsGrid";
import CategoryTab from "../components/CategoryTab";

const HomePage = () => {
	const { fetchAllProducts, products, fetchProductsByCategory } = useProductStore();
	const [activeCategory, setActiveCategory] = useState("All");
	const navigate = useNavigate();

	useEffect(() => {
		if (activeCategory === "All") {
			fetchAllProducts();
		} else {
			fetchProductsByCategory(activeCategory);
		}
	}, [activeCategory, fetchAllProducts, fetchProductsByCategory]);

	const handleCardClick = (product) => {
		navigate(`/product/${product._id}`);
	};

	const allCategories = [{ name: "All", id: "all", imageUrl: "/logo.jpg" }, ...categories];

	return (
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
							onClick={() => setActiveCategory(category.name)}
							isActive={activeCategory === category.name}
						/>
					))}
				</div>

				<CustomerProductsGrid products={products} onCardClick={handleCardClick} />
			</div>
		</div>
	);
};
export default HomePage;
