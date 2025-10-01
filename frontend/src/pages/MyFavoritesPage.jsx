import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/ProductCard";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MyFavoritesPage = () => {
	const navigate = useNavigate();

	const {
		data: favorites,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["myFavorites"],
		queryFn: () => axios.get("/favorites").then((res) => res.data),
	});

	const handleCardClick = (product) => {
		navigate(`/product/${product._id}`);
	};

	if (isLoading) {
		return <LoadingSpinner fullScreen />;
	}

	if (isError) {
		return (
			<div className='text-center py-10 text-red-400'>
				<p>Could not load your favorite items.</p>
			</div>
		);
	}

	return (
		<div className='container mx-auto p-4 sm:p-8'>
			<h1 className='text-3xl font-bold text-emerald-400 mb-8 flex items-center'>
				<Heart className='mr-4' /> My Favorite Items
			</h1>
			{favorites && favorites.length > 0 ? (
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
					{favorites.map((product) => (
						<ProductCard key={product._id} product={product} onCardClick={handleCardClick} />
					))}
				</div>
			) : (
				<div className='text-center py-16 bg-gray-800 rounded-lg'>
					<Heart size={48} className='mx-auto text-gray-500 mb-4' />
					<h2 className='text-2xl font-bold text-white'>Your Favorites List is Empty</h2>
					<p className='text-gray-400 mt-2'>
						Click the heart icon on products to save them for later.
					</p>
				</div>
			)}
		</div>
	);
};

export default MyFavoritesPage;