import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { Star, Trash2 } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import ConfirmationModal from "./ConfirmationModal";
import { useState } from "react";

const ReviewsTab = () => {
	const queryClient = useQueryClient();
	const [reviewToDelete, setReviewToDelete] = useState(null);

	const {
		data: reviews,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["allReviews"],
		queryFn: async () => {
			const res = await axios.get("/reviews");
			return res.data;
		},
	});

	const { mutate: deleteReview, isPending: isDeleting } = useMutation({
		mutationFn: (reviewId) => axios.delete(`/reviews/${reviewId}`),
		onSuccess: () => {
			toast.success("Review deleted successfully");
			queryClient.invalidateQueries(["allReviews"]);
			setReviewToDelete(null);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to delete review");
			setReviewToDelete(null);
		},
	});

	if (isLoading) return <LoadingSpinner />;
	if (isError) return <p className='text-red-400'>Error loading reviews.</p>;

	return (
		<>
			{reviewToDelete && (
				<ConfirmationModal
					message={`Are you sure you want to delete this review? This action cannot be undone.`}
					onConfirm={() => deleteReview(reviewToDelete)}
					onCancel={() => setReviewToDelete(null)}
					isPending={isDeleting}
				/>
			)}
			<div className='bg-gray-800 p-6 rounded-lg shadow-lg'>
				<h2 className='text-2xl font-bold text-white mb-6'>Manage Reviews</h2>
				<div className='overflow-x-auto'>
					<table className='min-w-full bg-gray-900'>
						<thead>
							<tr>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
									Product
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
									User
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
									Rating
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
									Comment
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
									Actions
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-700'>
							{reviews.map((review) => (
								<tr key={review._id}>
									<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
										{review.product?.name || "N/A"}
									</td>
									<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
										{review.user?.name || "N/A"}
									</td>
									<td className='px-6 py-4 whitespace-nowrap'>
										<div className='flex items-center'>
											<span className='text-yellow-400 mr-1'>{review.rating}</span>
											<Star className='w-4 h-4 text-yellow-400 fill-current' />
										</div>
									</td>
									<td className='px-6 py-4 text-sm text-gray-300 max-w-xs truncate'>
										{review.comment}
									</td>
									<td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
										<button
											onClick={() => setReviewToDelete(review._id)}
											className='text-red-500 hover:text-red-700'
											aria-label='Delete review'
										>
											<Trash2 className='w-5 h-5' />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{reviews.length === 0 && (
					<p className='text-center py-8 text-gray-500'>No reviews found.</p>
				)}
			</div>
		</>
	);
};

export default ReviewsTab;
