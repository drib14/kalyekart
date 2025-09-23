import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";
import { Star, UserCircle } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const StarRating = ({ rating }) => {
	const totalStars = 5;
	const fullStars = Math.floor(rating);
	const halfStar = rating % 1 !== 0;
	const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);

	return (
		<div className='flex items-center'>
			{[...Array(fullStars)].map((_, i) => (
				<Star key={`full-${i}`} className='w-5 h-5 text-yellow-400 fill-current' />
			))}
			{halfStar && <Star className='w-5 h-5 text-yellow-400 fill-current' style={{ clipPath: "inset(0 50% 0 0)" }} />}
			{[...Array(emptyStars)].map((_, i) => (
				<Star key={`empty-${i}`} className='w-5 h-5 text-gray-600 fill-current' />
			))}
		</div>
	);
};

const ProductReviews = ({ product }) => {
	const {
		data: reviews,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["reviews", product._id],
		queryFn: async () => {
			const res = await axios.get(`/reviews/product/${product._id}`);
			return res.data;
		},
	});

	if (isLoading) return <LoadingSpinner size='sm' />;
	if (isError) return <p className='text-red-400 text-sm'>Could not load reviews.</p>;

	return (
		<div>
			<div className='flex items-center gap-2 mb-4'>
				<StarRating rating={product.averageRating} />
				<span className='text-gray-400'>
					({product.numReviews} review{product.numReviews !== 1 && "s"})
				</span>
			</div>
			<div className='space-y-4 max-h-48 overflow-y-auto'>
				{reviews.length === 0 ? (
					<p className='text-gray-500 italic'>No reviews yet.</p>
				) : (
					reviews.map((review) => (
						<div key={review._id} className='bg-gray-700 p-3 rounded-lg'>
							<div className='flex items-center mb-2'>
								{review.user.profilePicture ? (
									<img
										src={review.user.profilePicture}
										alt={review.user.name}
										className='w-8 h-8 rounded-full object-cover mr-3'
									/>
								) : (
									<UserCircle className='w-8 h-8 text-gray-500 mr-3' />
								)}
								<div>
									<p className='font-semibold text-white'>{review.user.name}</p>
									<StarRating rating={review.rating} />
								</div>
							</div>
							<p className='text-gray-300 text-sm'>{review.comment}</p>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default ProductReviews;
