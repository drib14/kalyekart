import { useEffect, useState } from "react";
import { useProductStore } from "../stores/useProductStore";
import ProductCard from "../components/ProductCard";
import { motion } from "framer-motion";

const categories = [
	{ name: "All", value: "all" },
	{ name: "Fried Vegetables", value: "fried-vegetables", imageUrl: "/lumpia.jpg" },
	{ name: "Fried Meat", value: "fried-meat", imageUrl: "/chicken.jpg" },
	{ name: "Fried Seafood", value: "fried-seafood", imageUrl: "/seafood.jpg" },
	{ name: "Extra", value: "extra", imageUrl: "/extra.jpg" },
	{ name: "Drinks", value: "drinks", imageUrl: "/drinks.jpg" },
];

const HomePage = () => {
	const { fetchAllProducts, products, isLoading } = useProductStore();
	const [selectedCategory, setSelectedCategory] = useState("all");

	useEffect(() => {
		fetchAllProducts();
	}, [fetchAllProducts]);

	const filteredProducts =
		selectedCategory === "all"
			? products.filter((product) => product.category !== "add-ons")
			: products.filter((product) => product.category === selectedCategory);

	return (
		<div className='relative min-h-screen text-white overflow-hidden'>
			<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
				<h1 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>Our Menu</h1>
				<p className='text-center text-xl text-gray-300 mb-12'>
					Delicious "pungko-pungko" street food, ready to be delivered to you.
				</p>

				<div className='flex justify-center items-center mb-8 gap-4'>
					<select
						onChange={(e) => setSelectedCategory(e.target.value)}
						value={selectedCategory}
						className='bg-gray-800 text-white border border-emerald-500 rounded-md px-4 py-2'
					>
						{categories.map((category) => (
							<option key={category.value} value={category.value}>
								{category.name}
							</option>
						))}
					</select>
					{selectedCategory !== "all" && (
						<img
							src={categories.find((c) => c.value === selectedCategory)?.imageUrl}
							alt={selectedCategory}
							className='w-12 h-12 rounded-md'
						/>
					)}
				</div>

				<motion.div
					className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					{isLoading ? (
						<p>Loading...</p>
					) : (
						filteredProducts.map((product) => <ProductCard key={product._id} product={product} />)
					)}
				</motion.div>
			</div>
		</div>
	);
};
export default HomePage;
