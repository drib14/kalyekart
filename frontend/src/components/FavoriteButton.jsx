import { Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "sonner";

const FavoriteButton = ({ product, className, standalone = false }) => {
	const queryClient = useQueryClient();

	// Selectors for more granular state updates
	const { user, refreshUser } = useUserStore((state) => ({
		user: state.user,
		refreshUser: state.refreshUser,
	}));
	const favorites = useUserStore((state) => state.user?.favorites);

	const isFavorited = favorites?.includes(product?._id);

	const { mutate: toggleFavorite, isLoading } = useMutation({
		mutationFn: () => axios.post(`/favorites/toggle/${product._id}`),
		onMutate: async () => {
			await queryClient.cancelQueries({ queryKey: ["myFavorites"] });
			const previousUser = useUserStore.getState().user;

			useUserStore.setState((state) => {
				const currentFavorites = state.user?.favorites || [];
				const newFavorites = !isFavorited
					? [...currentFavorites, product._id]
					: currentFavorites.filter((id) => id !== product._id);
				return { user: { ...state.user, favorites: newFavorites } };
			});

			toast.success(`Product ${!isFavorited ? "added to" : "removed from"} favorites.`);
			return { previousUser };
		},
		onError: (err, variables, context) => {
			useUserStore.setState({ user: context.previousUser });
			toast.error("Failed to update favorites. Please try again.");
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: ["myFavorites"] });
			refreshUser();
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