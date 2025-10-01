import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";
import { Star, User } from "lucide-react";
import { format } from "date-fns";

const ReviewsList = ({ productId }) => {
	const { data: reviews, isLoading } = useQuery({
		queryKey: ["reviews", productId],
		queryFn: async () => {
			const res = await axios.get(`/reviews/${productId}`);
			return res.data;
		},
		enabled: !!productId,
	});

	if (isLoading) return <p>Loading reviews...</p>;

	if (!reviews || reviews.length === 0) {
		return <p>No reviews yet. Be the first to review!</p>;
	}

	return (
		<div className='space-y-6'>
			{reviews.map((review) => (
				<div key={review._id} className='flex items-start space-x-4 bg-gray-800 p-4 rounded-lg'>
					{review.user.profilePicture ? (
						<img
							src={review.user.profilePicture}
							alt={review.user.name}
							className='w-12 h-12 rounded-full object-cover'
						/>
					) : (
						<div className='w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center'>
							<User className='text-gray-400' />
						</div>
					)}
					<div className='flex-1'>
						<div className='flex items-center justify-between'>
							<h4 className='font-bold text-white'>{review.user.name}</h4>
							<span className='text-xs text-gray-400'>
								{format(new Date(review.createdAt), "PPP")}
							</span>
						</div>
						<div className='flex items-center my-1'>
							{[...Array(5)].map((_, i) => (
								<Star
									key={i}
									size={16}
									className={`
										${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-600"}
									`}
								/>
							))}
						</div>
						<p className='text-gray-300'>{review.comment}</p>
					</div>
				</div>
			))}
		</div>
	);
};

export default ReviewsList;