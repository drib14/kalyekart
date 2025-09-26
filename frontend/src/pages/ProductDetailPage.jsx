import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { ShoppingCart, Star, ArrowLeft } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { toast } from "sonner";

const ProductDetailPage = () => {
	const { productId } = useParams();
	const { addToCart } = useCartStore();

	const {
		data: product,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["product", productId],
		queryFn: async () => {
			const res = await axios.get(`/products/${productId}`);
			return res.data;
		},
	});

	if (isLoading) {
		return <LoadingSpinner fullScreen={true} />;
	}

	if (isError) {
		return (
			<div className='text-center py-10 text-red-500'>
				Error: {error.response?.data?.message || "Failed to fetch product."}
			</div>
		);
	}

	if (!product) {
		return <div className='text-center py-10'>Product not found.</div>;
	}

	const handleAddToCart = () => {
		addToCart(product);
		toast.success(`${product.name} added to cart!`);
	};

	return (
		<div className='min-h-screen bg-gray-900 text-white p-4 sm:p-8'>
			<div className='max-w-6xl mx-auto'>
				<Link
					to='/'
					className='inline-flex items-center text-emerald-400 hover:text-emerald-300 mb-8'
				>
					<ArrowLeft size={20} className='mr-2' />
					Back to Products
				</Link>
				<div className='grid md:grid-cols-2 gap-8 lg:gap-12'>
					<div>
						<img
							src={product.image}
							alt={product.name}
							className='w-full h-auto object-cover rounded-lg shadow-lg'
						/>
					</div>
					<div className='flex flex-col justify-center'>
						<h1 className='text-4xl lg:text-5xl font-bold text-white mb-4'>{product.name}</h1>
						<p className='text-gray-400 mb-6 text-lg'>{product.description}</p>
						<div className='flex items-center mb-6'>
							<div className='flex items-center text-yellow-400'>
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										size={20}
										className={i < Math.round(product.averageRating) ? "fill-current" : ""}
									/>
								))}
							</div>
							<span className='ml-3 text-gray-300'>
								{product.averageRating?.toFixed(1) || "No ratings"} ({product.reviewCount} reviews)
							</span>
						</div>
						<div className='text-4xl font-bold text-emerald-400 mb-8'>
							₱{product.price.toFixed(2)}
						</div>
						<button
							onClick={handleAddToCart}
							className='w-full max-w-sm bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center text-lg transition-transform transform hover:scale-105'
						>
							<ShoppingCart size={24} className='mr-3' />
							Add to Cart
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProductDetailPage;