import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const AddReviewForm = ({ productId }) => {
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [hoverRating, setHoverRating] = useState(0);
	const { user } = useUserStore();
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: (newReview) => {
			return axios.post(`/reviews/${productId}`, newReview);
		},
		onSuccess: () => {
			toast.success("Review submitted successfully!");
			queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
			queryClient.invalidateQueries({ queryKey: ["product", productId] });
			setRating(0);
			setComment("");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to submit review.");
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (rating === 0) {
			toast.error("Please select a star rating.");
			return;
		}
		mutation.mutate({ rating, comment });
	};

	if (!user) {
		return <p className='text-gray-400'>Please log in to leave a review.</p>;
	}

	return (
		<form onSubmit={handleSubmit} className='bg-gray-800 p-6 rounded-lg'>
			<h3 className='text-xl font-bold text-white mb-4'>Write a Review</h3>
			<div className='mb-4'>
				<label className='block text-gray-300 mb-2'>Your Rating</label>
				<div className='flex items-center'>
					{[...Array(5)].map((_, index) => {
						const starValue = index + 1;
						return (
							<Star
								key={starValue}
								size={24}
								className={`cursor-pointer ${
									starValue <= (hoverRating || rating)
										? "text-yellow-400 fill-current"
										: "text-gray-600"
								}`}
								onClick={() => setRating(starValue)}
								onMouseEnter={() => setHoverRating(starValue)}
								onMouseLeave={() => setHoverRating(0)}
							/>
						);
					})}
				</div>
			</div>
			<div className='mb-4'>
				<label htmlFor='comment' className='block text-gray-300 mb-2'>
					Your Comment
				</label>
				<textarea
					id='comment'
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					className='w-full bg-gray-700 text-white rounded-md p-2'
					rows='4'
					required
				></textarea>
			</div>
			<button
				type='submit'
				className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded'
				disabled={mutation.isPending}
			>
				{mutation.isPending ? "Submitting..." : "Submit Review"}
			</button>
		</form>
	);
};

export default AddReviewForm;