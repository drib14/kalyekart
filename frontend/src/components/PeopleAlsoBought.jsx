import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "../lib/axios";
import { toast } from "sonner";
import LoadingSpinner from "./LoadingSpinner";
import ProductDetailModal from "./ProductDetailModal";

const PeopleAlsoBought = () => {
	const [recommendations, setRecommendations] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selectedProduct, setSelectedProduct] = useState(null);

	useEffect(() => {
		const fetchRecommendations = async () => {
			try {
				const res = await axios.get("/products/recommendations");
				setRecommendations(res.data);
			} catch (error) {
				toast.error(error.response.data.message || "An error occurred while fetching recommendations");
			} finally {
				setIsLoading(false);
			}
		};

		fetchRecommendations();
	}, []);

	const handleCardClick = (product) => {
		setSelectedProduct(product);
	};

	const handleCloseModal = () => {
		setSelectedProduct(null);
	};

	if (isLoading) return <LoadingSpinner />;

	return (
		<>
			{selectedProduct && <ProductDetailModal product={selectedProduct} onClose={handleCloseModal} />}
			<div className='mt-8'>
				<h3 className='text-2xl font-semibold text-emerald-400'>People also bought</h3>
				<div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg: grid-col-3'>
					{recommendations.map((product) => (
						<ProductCard key={product._id} product={product} onCardClick={handleCardClick} />
					))}
				</div>
			</div>
		</>
	);
};
export default PeopleAlsoBought;
