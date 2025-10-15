import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "sonner";

const FavoriteButton = ({ product, className, standalone = false }) => {
	const queryClient = useQueryClient();

	const { user, refreshUser } = useUserStore((state) => ({
		user: state.user,
		refreshUser: state.refreshUser,
	}));
	const favorites = useUserStore((state) => state.user?.favorites);

	const isFavorited = favorites?.includes(product?._id);

	const { mutate: toggleFavorite, isLoading } = useMutation({
		mutationFn: () => axios.post(`/favorites/toggle/${product._id}`),
		onSuccess: () => {
			const wasFavorited = isFavorited;
			refreshUser().then(() => {
				toast.success(`Product ${!wasFavorited ? "added to" : "removed from"} favorites.`);
				queryClient.invalidateQueries({ queryKey: ["myFavorites"] });
			});
		},
		onError: (err) => {
			toast.error("Failed to update favorites. Please try again.");
			console.error(err);
		},
	});

	const handleFavoriteClick = (e) => {
		e.stopPropagation();
		if (!user) {
			toast.info("Please log in to favorite items.");
			return;
		}
		toggleFavorite();
	};

	if (!product) return null;

	const buttonClasses = standalone
		? `p-3 rounded-full transition-colors duration-200 ${
				isFavorited
					? "bg-red-500 text-white"
					: "bg-gray-700 text-gray-300 hover:bg-red-500 hover:text-white"
		  }`
		: `absolute top-2 right-2 p-1.5 rounded-full transition-colors duration-200 ${
				isFavorited
					? "bg-red-500/80 text-white"
					: "bg-black/50 text-gray-300 hover:bg-red-500/80 hover:text-white"
		  }`;

	return (
		<button
			onClick={handleFavoriteClick}
			disabled={isLoading}
			className={`${buttonClasses} ${className}`}
			aria-label='Toggle Favorite'
			title='Add to Favorites'
		>
			<Heart
				size={standalone ? 24 : 20}
				className={`transition-transform duration-200 ${
					isFavorited ? "fill-current scale-110" : "group-hover:fill-red-500/50"
				}`}
			/>
		</button>
	);
};

export default FavoriteButton;