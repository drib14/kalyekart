import { useState } from "react";
import { X, Heart, Minus, Plus, ShoppingCart, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "../stores/useCartStore";
import { useNavigate } from "react-router-dom";

const ProductDetailModal = ({ product, onClose }) => {
	const [quantity, setQuantity] = useState(1);
	const [isFavorite, setIsFavorite] = useState(false); // Placeholder state
	const { addToCart } = useCartStore();
	const navigate = useNavigate();

	const handleFavoriteClick = () => {
		setIsFavorite(!isFavorite);
		toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
	};

	const handleAddToCart = () => {
		// A more robust solution would be a new store action to add a specific quantity
		for (let i = 0; i < quantity; i++) {
			addToCart(product);
		}
		toast.success(`${quantity} ${product.name}(s) added to cart!`);
	};

	const handleCheckout = () => {
		handleAddToCart();
		onClose();
		navigate("/checkout");
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-2 sm:p-4'>
			<div className='bg-gray-800 rounded-lg shadow-xl max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl w-full relative max-h-[90vh] overflow-y-auto'>
				<button
					onClick={onClose}
					className='absolute top-2 right-2 text-gray-400 hover:text-white z-10'
				>
					<X size={24} />
				</button>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6'>
					<div className='p-2 sm:p-4'>
						<img
							src={product.image}
							alt={product.name}
							className='w-full h-auto max-h-64 sm:max-h-80 md:max-h-96 object-cover rounded-lg'
						/>
					</div>

					<div className='p-4 md:p-6 flex flex-col justify-between'>
						<div>
							<h2 className='text-2xl md:text-3xl font-bold text-white mb-2'>{product.name}</h2>
							<p className='text-gray-400 mb-4 text-sm'>{product.description}</p>
							<div className='flex items-center justify-between mb-4'>
								<p className='text-3xl md:text-4xl font-extrabold text-emerald-400'>₱{product.price}</p>
								<button onClick={handleFavoriteClick}>
									<Heart
										size={24}
										className={`transition-colors ${
											isFavorite ? "text-red-500 fill-current" : "text-gray-500"
										}`}
									/>
								</button>
							</div>

							<div className='mb-4'>
								<h3 className='text-lg font-semibold text-white mb-2'>Quantity</h3>
								<div className='flex items-center gap-4'>
									<button
										onClick={() => setQuantity((q) => Math.max(1, q - 1))}
										className='p-2 rounded-full bg-gray-700 hover:bg-gray-600'
									>
										<Minus size={20} />
									</button>
									<span className='text-2xl font-bold'>{quantity}</span>
									<button
										onClick={() => setQuantity((q) => q + 1)}
										className='p-2 rounded-full bg-gray-700 hover:bg-gray-600'
									>
										<Plus size={20} />
									</button>
									<div className='ml-auto text-gray-400'>
										Total: <span className='font-bold text-white'>₱{(product.price * quantity).toFixed(2)}</span>
									</div>
								</div>
							</div>

							<div className='mb-4'>
								<h3 className='text-lg font-semibold text-white mb-2'>Reviews</h3>
								<p className='text-gray-500 italic'>Coming soon...</p>
							</div>
						</div>

						<div className='flex gap-3'>
							<button
								className='flex-1 flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-3 text-center text-base font-medium
								 text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300'
								onClick={handleAddToCart}
							>
								<ShoppingCart size={22} className='mr-2' />
								Add to Cart
							</button>
							<button
								className='flex-1 flex items-center justify-center rounded-lg bg-gray-600 px-5 py-3 text-center text-base font-medium
								 text-white hover:bg-gray-500 focus:outline-none focus:ring-4 focus:ring-gray-400'
								onClick={handleCheckout}
							>
								<CheckCircle size={22} className='mr-2' />
								Checkout
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductDetailModal;
