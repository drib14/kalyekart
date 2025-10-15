import { useUserStore } from "../stores/useUserStore";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";

const FavoritesPage = () => {
	const { favorites } = useUserStore();
	const navigate = useNavigate();

	const handleCardClick = (product) => {
		navigate(`/products/${product._id}`);
	};

	return (
		<div className='container mx-auto px-4 py-8'>
			<h1 className='text-3xl font-bold mb-8'>Your Favorites</h1>
			{favorites.length > 0 ? (
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8'>
					{favorites.map((product) => (
						<ProductCard key={product._id} product={product} onCardClick={handleCardClick} />
					))}
				</div>
			) : (
				<p className='text-center text-gray-500'>You have no favorite products yet.</p>
			)}
		</div>
	);
};

export default FavoritesPage;