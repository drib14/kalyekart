import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { Star, Send } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const ReviewForm = ({ productId, onClose, onReviewSubmit }) => {
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [hoverRating, setHoverRating] = useState(0);

	const { mutate: submitReview, isPending } = useMutation({
		mutationFn: (newReview) => axios.post(`/reviews/product/${productId}`, newReview),
		onSuccess: () => {
			toast.success("Review submitted successfully!");
			onReviewSubmit();
			onClose();
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to submit review.");
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (rating === 0) {
			return toast.error("Please select a rating.");
		}
		submitReview({ rating, comment });
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4'>
			<div className='bg-gray-800 rounded-lg shadow-xl max-w-md w-full relative'>
				<div className='p-6'>
					<h2 className='text-2xl font-bold text-white mb-4'>Write a Review</h2>
					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>Your Rating</label>
							<div className='flex items-center'>
								{[...Array(5)].map((_, index) => {
									const starValue = index + 1;
									return (
										<button
											type='button'
											key={starValue}
											onMouseEnter={() => setHoverRating(starValue)}
											onMouseLeave={() => setHoverRating(0)}
											onClick={() => setRating(starValue)}
											className='focus:outline-none'
										>
											<Star
												className={`w-8 h-8 transition-colors ${
													starValue <= (hoverRating || rating)
														? "text-yellow-400 fill-current"
														: "text-gray-600"
												}`}
											/>
										</button>
									);
								})}
							</div>
						</div>
						<div>
							<label htmlFor='comment' className='block text-sm font-medium text-gray-300'>
								Your Comment
							</label>
							<textarea
								id='comment'
								rows='4'
								value={comment}
								onChange={(e) => setComment(e.target.value)}
								className='mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
								required
							/>
						</div>
						<div className='flex justify-end gap-4 pt-2'>
							<button
								type='button'
								onClick={onClose}
								className='py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md text-white'
							>
								Cancel
							</button>
							<button
								type='submit'
								disabled={isPending}
								className='py-2 px-4 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white flex items-center disabled:opacity-50'
							>
								{isPending ? (
									<LoadingSpinner size='sm' />
								) : (
									<>
										<Send className='w-4 h-4 mr-2' />
										Submit Review
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default ReviewForm;
