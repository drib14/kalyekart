import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "sonner";

const FavoriteButton = ({ product, className }) => {
	const { user } = useUserStore();
	const queryClient = useQueryClient();
	const [isFavorited, setIsFavorited] = useState(false);

	useEffect(() => {
		if (user && product) {
			setIsFavorited(user.favorites?.includes(product._id));
		}
	}, [user, product]);

	const { mutate: toggleFavorite, isLoading } = useMutation({
		mutationFn: () => axios.post(`/favorites/toggle/${product._id}`),
		onSuccess: (data) => {
			const newFavorites = data.data.favorites;
			setIsFavorited(newFavorites.includes(product._id));
			queryClient.invalidateQueries(["myFavorites"]);
			// Update the user object in the user store
			useUserStore.setState((state) => ({
				user: { ...state.user, favorites: newFavorites },
			}));
			toast.success(
				`Product ${
					newFavorites.includes(product._id) ? "added to" : "removed from"
				} favorites.`
			);
		},
		onError: (error) => {
			console.error("Error toggling favorite:", error);
			toast.error("Could not update favorite status.");
		},
	});

	const handleFavoriteClick = (e) => {
		e.stopPropagation(); // Prevent card click event
		if (!user) {
			toast.info("Please log in to favorite items.");
			return;
		}
		toggleFavorite();
	};

	if (!product) return null;

	return (
		<button
			onClick={handleFavoriteClick}
			disabled={isLoading}
			className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors duration-200 ${
				isFavorited
					? "bg-red-500/80 text-white"
					: "bg-black/50 text-gray-300 hover:bg-red-500/80 hover:text-white"
			} ${className}`}
			aria-label='Toggle Favorite'
		>
			<Heart
				size={20}
				className={`transition-transform duration-200 ${
					isFavorited ? "fill-current scale-110" : ""
				}`}
			/>
		</button>
	);
};

export default FavoriteButton;