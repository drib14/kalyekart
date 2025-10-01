import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { format } from "date-fns";
import { Star, Trash } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import ConfirmationModal from "./ConfirmationModal";
import { useState } from "react";

const ManageReviewsTab = () => {
	const queryClient = useQueryClient();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [reviewToDelete, setReviewToDelete] = useState(null);

	const { data: reviews, isLoading } = useQuery({
		queryKey: ["allReviews"],
		queryFn: async () => {
			const res = await axios.get("/reviews");
			return res.data;
		},
	});

	const deleteMutation = useMutation({
		mutationFn: (reviewId) => axios.delete(`/reviews/${reviewId}`),
		onSuccess: () => {
			toast.success("Review deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["allReviews"] });
			queryClient.invalidateQueries({ queryKey: ["products"] });
			queryClient.invalidateQueries({ queryKey: ["product"] });
			queryClient.invalidateQueries({ queryKey: ["most-reviewed"] });
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to delete review.");
		},
	});

	const handleDeleteClick = (reviewId) => {
		setReviewToDelete(reviewId);
		setIsModalOpen(true);
	};

	const handleConfirmDelete = () => {
		if (reviewToDelete) {
			deleteMutation.mutate(reviewToDelete);
		}
		setIsModalOpen(false);
		setReviewToDelete(null);
	};

	if (isLoading) return <LoadingSpinner />;

	return (
		<>
			<ConfirmationModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onConfirm={handleConfirmDelete}
				title='Delete Review'
				message='Are you sure you want to delete this review? This action cannot be undone.'
			/>
			<div className='bg-gray-800 shadow-lg rounded-lg overflow-hidden'>
				<div className='overflow-x-auto'>
					<table className='min-w-full divide-y divide-gray-700'>
						<thead className='bg-gray-700'>
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
									Date
								</th>
								<th className='px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider'>
									Actions
								</th>
							</tr>
						</thead>
						<tbody className='bg-gray-800 divide-y divide-gray-700'>
							{reviews?.map((review) => (
								<tr key={review._id}>
									<td className='px-6 py-4 whitespace-nowrap text-sm text-white'>
										{review.product?.name || "N/A"}
									</td>
									<td className='px-6 py-4 whitespace-nowrap text-sm text-white'>
										{review.user?.name || "N/A"}
									</td>
									<td className='px-6 py-4 whitespace-nowrap'>
										<div className='flex items-center'>
											<Star size={16} className='text-yellow-400 fill-current mr-1' />
											{review.rating}
										</div>
									</td>
									<td className='px-6 py-4'>
										<p className='text-sm text-white max-w-xs truncate'>{review.comment}</p>
									</td>
									<td className='px-6 py-4 whitespace-nowrap text-sm text-gray-400'>
										{format(new Date(review.createdAt), "PPP")}
									</td>
									<td className='px-6 py-4 whitespace-nowrap'>
										<button
											onClick={() => handleDeleteClick(review._id)}
											className='text-red-400 hover:text-red-300'
										>
											<Trash size={18} />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</>
	);
};

export default ManageReviewsTab;