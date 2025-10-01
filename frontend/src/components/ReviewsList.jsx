import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { Star, User, ThumbsUp, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "sonner";

const ReviewsList = ({ productId }) => {
	const { user } = useUserStore();
	const queryClient = useQueryClient();
	const [replyingTo, setReplyingTo] = useState(null);
	const [replyComment, setReplyComment] = useState("");

	const { data: reviews, isLoading } = useQuery({
		queryKey: ["reviews", productId],
		queryFn: async () => {
			const res = await axios.get(`/reviews/${productId}`);
			return res.data;
		},
		enabled: !!productId,
	});

	const likeMutation = useMutation({
		mutationFn: (reviewId) => axios.post(`/reviews/${reviewId}/like`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
		},
	});

	const replyMutation = useMutation({
		mutationFn: ({ reviewId, comment }) => axios.post(`/reviews/${reviewId}/reply`, { comment }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
			setReplyingTo(null);
			setReplyComment("");
			toast.success("Reply added!");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to add reply.");
		},
	});

	const handleReplySubmit = (e, reviewId) => {
		e.preventDefault();
		replyMutation.mutate({ reviewId, comment: replyComment });
	};

	if (isLoading) return <p>Loading reviews...</p>;

	if (!reviews || reviews.length === 0) {
		return <p>No reviews yet. Be the first to review!</p>;
	}

	return (
		<div className='space-y-6'>
			{reviews.map((review) => (
				<div key={review._id} className='bg-gray-800 p-4 rounded-lg'>
					<div className='flex items-start space-x-4'>
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
								<span className='text-xs text-gray-400'>{format(new Date(review.createdAt), "PPP")}</span>
							</div>
							<div className='flex items-center my-1'>
								{[...Array(5)].map((_, i) => (
									<Star
										key={i}
										size={16}
										className={`${
											i < review.rating ? "text-yellow-400 fill-current" : "text-gray-600"
										}`}
									/>
								))}
							</div>
							<p className='text-gray-300 mt-2'>{review.comment}</p>
							<div className='flex items-center space-x-4 mt-3 text-sm text-gray-400'>
								<button
									onClick={() => likeMutation.mutate(review._id)}
									className={`flex items-center hover:text-emerald-400 ${
										review.likes.includes(user?._id) ? "text-emerald-500" : ""
									}`}
									disabled={!user}
								>
									<ThumbsUp size={16} className='mr-1' /> {review.likes.length}
								</button>
								<button
									onClick={() => setReplyingTo(replyingTo === review._id ? null : review._id)}
									className='flex items-center hover:text-emerald-400'
									disabled={!user}
								>
									<MessageSquare size={16} className='mr-1' /> {review.replies.length}
								</button>
							</div>

							{replyingTo === review._id && (
								<form onSubmit={(e) => handleReplySubmit(e, review._id)} className='mt-4 ml-14'>
									<textarea
										value={replyComment}
										onChange={(e) => setReplyComment(e.target.value)}
										className='w-full bg-gray-700 text-white rounded-md p-2 text-sm'
										rows='2'
										placeholder='Write a reply...'
										required
									></textarea>
									<button
										type='submit'
										className='mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-3 rounded text-sm'
										disabled={replyMutation.isPending}
									>
										{replyMutation.isPending ? "Replying..." : "Reply"}
									</button>
								</form>
							)}

							{review.replies && review.replies.length > 0 && (
								<div className='mt-4 ml-14 space-y-4 border-l-2 border-gray-700 pl-4'>
									{review.replies.map((reply) => (
										<div key={reply._id} className='flex items-start space-x-3'>
											<User size={16} className='text-gray-500 mt-1' />
											<div>
												<p className='text-sm font-bold text-white'>{reply.user.name}</p>
												<p className='text-sm text-gray-300'>{reply.comment}</p>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default ReviewsList;