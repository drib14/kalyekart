import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { format } from "date-fns";
import { Star, MessageSquare, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";

const MyReviewsPage = () => {
	const { data: reviews, isLoading } = useQuery({
		queryKey: ["myReviews"],
		queryFn: async () => {
			const res = await axios.get("/reviews/my-reviews");
			return res.data;
		},
	});

	if (isLoading) return <LoadingSpinner fullScreen />;

	return (
		<div className='container mx-auto p-4 sm:p-8'>
			<h1 className='text-3xl font-bold text-emerald-400 mb-8'>My Reviews</h1>
			{reviews && reviews.length > 0 ? (
				<div className='space-y-6'>
					{reviews.map((review) => (
						<div key={review._id} className='bg-gray-800 p-6 rounded-lg'>
							<div className='flex justify-between items-start'>
								<div className='flex items-start space-x-4'>
									<img
										src={review.product.image}
										alt={review.product.name}
										className='w-20 h-20 object-cover rounded-lg'
									/>
									<div>
										<Link
											to={`/product/${review.product._id}`}
											className='text-xl font-bold text-white hover:text-emerald-400'
										>
											{review.product.name}
										</Link>
										<div className='flex items-center my-2'>
											{[...Array(5)].map((_, i) => (
												<Star
													key={i}
													size={18}
													className={i < review.rating ? "text-yellow-400 fill-current" : "text-gray-600"}
												/>
											))}
										</div>
										<p className='text-gray-300'>{review.comment}</p>
									</div>
								</div>
								<span className='text-sm text-gray-400'>
									{format(new Date(review.createdAt), "PPP")}
								</span>
							</div>
							<div className='flex items-center space-x-4 mt-4 text-sm text-gray-400'>
								<div className='flex items-center'>
									<ThumbsUp size={16} className='mr-1' /> {review.likes.length} Likes
								</div>
								<div className='flex items-center'>
									<MessageSquare size={16} className='mr-1' /> {review.replies.length} Replies
								</div>
							</div>
						</div>
					))}
				</div>
			) : (
				<p className='text-gray-400'>You have not written any reviews yet.</p>
			)}
		</div>
	);
};

export default MyReviewsPage;