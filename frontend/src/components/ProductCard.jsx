import { toast } from "sonner";
import { ShoppingCart, ShoppingBag, Star, Heart } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, onCardClick }) => {
	const { user, favorites, addFavorite, removeFavorite } = useUserStore();
	const { addToCart } = useCartStore();
	const navigate = useNavigate();

	const isFavorite = favorites.some((fav) => fav._id === product._id);

	const handleFavoriteClick = (e) => {
		e.stopPropagation();
		if (!user) {
			toast.error("Please login to manage your favorites", { id: "login" });
			return;
		}
		if (isFavorite) {
			removeFavorite(product._id);
		} else {
			addFavorite(product._id);
		}
	};

	const handleAddToCart = (e) => {
		e.stopPropagation();
		if (!user) {
			toast.error("Please login to add products to cart", { id: "login" });
			return;
		}
		if (user.role !== "customer") {
			toast.error("Only customers can place orders.");
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
		if (user.role !== "customer") {
			toast.error("Only customers can place orders.");
			return;
		}
		addToCart(product);
		navigate("/checkout");
	};

	return (
		<div
			className='flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg cursor-pointer'
			onClick={() => onCardClick(product)}
		>
			<div className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl'>
				<img className='object-cover w-full' src={product.image} alt={product.name} />
				<div className='absolute inset-0 bg-black bg-opacity-20' />
				<button
					className='absolute top-2 right-2 rounded-full p-2 bg-white/80 hover:bg-white'
					onClick={handleFavoriteClick}
				>
					<Heart
						size={24}
						className={`transition-colors ${
							isFavorite ? "text-red-500 fill-current" : "text-gray-600"
						}`}
					/>
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
						{(product.averageRating || 0).toFixed(1)}
					</span>
					<span className='text-sm text-gray-400'>({product.numReviews || 0} reviews)</span>
				</div>
				<div className='mt-2 mb-5 flex items-center justify-between'>
					<p>
						<span className='text-3xl font-bold text-emerald-400'>₱{(product.price || 0).toFixed(2)}</span>
					</p>
				</div>
				<div className='flex items-center gap-2'>
					<button
						className={`flex-grow flex items-center justify-center rounded-lg px-4 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4 ${
							user && user.role !== "customer"
								? "bg-gray-600 cursor-not-allowed"
								: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-300"
						}`}
						onClick={handleAddToCart}
						disabled={user && user.role !== "customer"}
						title={user && user.role !== "customer" ? "Only customers can order" : "Add to cart"}
					>
						<ShoppingCart size={20} className='mr-2' />
						Add to cart
					</button>
					<button
						className={`rounded-lg p-2.5 text-white ${
							user && user.role !== "customer"
								? "bg-gray-700 cursor-not-allowed"
								: "bg-gray-600 hover:bg-gray-500"
						}`}
						onClick={handleCheckout}
						disabled={user && user.role !== "customer"}
						title={user && user.role !== "customer" ? "Only customers can order" : "Checkout"}
					>
						<ShoppingBag size={20} />
					</button>
				</div>
			</div>
		</div>
	);
};
export default ProductCard;