import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";
import { Link } from "react-router-dom";

const MostReviewedProducts = () => {
	const { data: products, isLoading } = useQuery({
		queryKey: ["mostReviewed"],
		queryFn: async () => {
			const res = await axios.get("/products/most-reviewed");
			return res.data;
		},
	});

	if (isLoading) return <p>Loading recommendations...</p>;

	if (!products || products.length === 0) {
		return null; // Don't render the section if there are no products
	}

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6'>
			{products.map((product) => (
				<Link to={`/product/${product._id}`} key={product._id} className='bg-gray-800 rounded-lg overflow-hidden transform hover:scale-105 transition-transform duration-300'>
					<img
						src={product.image}
						alt={product.name}
						className='w-full h-40 object-cover'
					/>
					<div className='p-4'>
						<h4 className='font-bold text-white truncate'>{product.name}</h4>
						<p className='text-emerald-400'>₱{(product.price || 0).toFixed(2)}</p>
					</div>
				</Link>
			))}
		</div>
	);
};

export default MostReviewedProducts;