import { toast } from "sonner";
import { ShoppingCart, Heart, ShoppingBag, Star } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";

const ProductCard = ({ product, onCardClick }) => {
	const { user, checkAuth } = useUserStore();
	const { addToCart } = useCartStore();
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const toggleFavoriteMutation = useMutation({
		mutationFn: () => axios.post(`/favorites/toggle/${product._id}`),
		onSuccess: () => {
			toast.success("Favorites updated!");
			// checkAuth will refetch user data and update the zustand store
			checkAuth();
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to update favorites.");
		},
	});

	const handleAddToCart = (e) => {
		e.stopPropagation();
		if (!user) {
			toast.error("Please login to add products to cart", { id: "login" });
			return;
		}
		addToCart(product);
	};

	const handleCheckout = (e) => {
		e.stopPropagation();
		if (!user) {
			toast.error("Please login to checkout", { id: "login" });
			return;
		}
		addToCart(product);
		navigate("/checkout");
	};

	const handleFavoriteClick = (e) => {
		e.stopPropagation();
		if (!user) {
			toast.error("Please login to favorite items.", { id: "login-favorite" });
			return;
		}
		toggleFavoriteMutation.mutate();
	};

	const isFavorited = user?.favorites?.includes(product._id);

	return (
		<div
			className='flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg cursor-pointer'
			onClick={() => onCardClick(product)}
		>
			<div className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl'>
				<img className='object-cover w-full' src={product.image} alt={product.name} />
				<div className='absolute inset-0 bg-black bg-opacity-20' />
				<button
					className='absolute top-2 right-2 flex items-center justify-center rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30 disabled:opacity-50'
					onClick={handleFavoriteClick}
					disabled={toggleFavoriteMutation.isPending}
				>
					<Heart size={20} className={isFavorited ? "fill-red-500 text-red-500" : ""} />
				</button>
			</div>

			<div className='mt-4 px-5 pb-5'>
				<h5 className='text-xl font-semibold tracking-tight text-white truncate' title={product.name}>
					{product.name}
				</h5>
				<div className='flex items-center mt-2.5 mb-5'>
					<div className='flex items-center text-yellow-400'>
						{[...Array(5)].map((_, i) => (
							<Star
								key={i}
								size={16}
								className={i < Math.round(product.averageRating) ? "fill-current" : ""}
							/>
						))}
					</div>
					<span className='bg-gray-700 text-gray-200 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded ml-3'>
						{product.averageRating.toFixed(1)}
					</span>
					<span className='text-sm text-gray-400'>({product.numReviews} reviews)</span>
				</div>
				<div className='mt-2 mb-5 flex items-center justify-between'>
					<p>
						<span className='text-3xl font-bold text-emerald-400'>₱{product.price}</span>
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<button
						className='flex-grow flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-medium
					 text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300'
						onClick={handleAddToCart}
					>
						<ShoppingCart size={20} className='mr-2' />
						Add to cart
					</button>
					<button
						className='rounded-lg bg-gray-600 p-2.5 text-white hover:bg-gray-500'
						onClick={handleCheckout}
					>
						<ShoppingBag size={20} />
					</button>
				</div>
			</div>
		</div>
	);
};
export default ProductCard;