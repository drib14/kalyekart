import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";
import LoadingSpinner from "./LoadingSpinner";
import { useCartStore } from "../stores/useCartStore";
import { toast } from "sonner";

const AddonsModal = ({ onClose }) => {
	const {
		data: products,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["products"],
		queryFn: async () => {
			const res = await axios.get("/products");
			return res.data;
		},
	});

	const { addToCart } = useCartStore();

	const handleAddToCart = (product) => {
		addToCart(product);
		toast.success("Added to cart");
	};

	if (isLoading) return <LoadingSpinner />;
	if (isError) return <div>Error loading products</div>;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'>
			<div className='bg-gray-800 p-8 rounded-lg shadow-lg max-w-lg w-full'>
				<h2 className='text-2xl font-bold text-white mb-6'>You might also like</h2>
				<div className='grid grid-cols-2 gap-4'>
					{products?.slice(0, 4).map((product) => (
						<div key={product._id} className='bg-gray-700 p-4 rounded-lg'>
							<img
								src={product.image}
								alt={product.name}
								className='w-full h-32 object-cover rounded-md mb-4'
							/>
							<p className='font-medium text-white'>{product.name}</p>
							<p className='text-sm text-gray-400'>₱{product.price.toFixed(2)}</p>
							<button
								onClick={() => handleAddToCart(product)}
								className='w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-md'
							>
								Add to Cart
							</button>
						</div>
					))}
				</div>
				<button
					onClick={onClose}
					className='w-full mt-6 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-md'
				>
					Continue to Checkout
				</button>
			</div>
		</div>
	);
};

export default AddonsModal;
