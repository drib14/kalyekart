import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { Star, User, ThumbsUp, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "sonner";

const Comment = ({ comment, productId, topLevelReviewId }) => {
	const { user } = useUserStore();
	const queryClient = useQueryClient();
	const [isReplying, setIsReplying] = useState(false);
	const [replyText, setReplyText] = useState("");

	const isTopLevelReview = comment._id === topLevelReviewId;

	const likeMutation = useMutation({
		mutationFn: () => {
			const url = isTopLevelReview
				? `/reviews/${topLevelReviewId}/like`
				: `/reviews/${topLevelReviewId}/replies/${comment._id}/like`;
			return axios.post(url);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to update like status.");
		},
	});

	const replyMutation = useMutation({
		mutationFn: (newReply) => {
			const url = isTopLevelReview
				? `/reviews/${topLevelReviewId}/reply`
				: `/reviews/${topLevelReviewId}/replies/${comment._id}`;
			return axios.post(url, newReply);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
			setIsReplying(false);
			setReplyText("");
			toast.success("Reply added!");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to add reply.");
		},
	});

	const handleLike = () => {
		if (!user) return toast.info("You must be logged in to like a comment.");
		likeMutation.mutate();
	};

    const handleReplySubmit = (e) => {
		e.preventDefault();
		if (!user) return toast.info("You must be logged in to reply.");
        if (!replyText.trim()) return toast.info("Reply cannot be empty.");
        replyMutation.mutate({ comment: replyText });
	};

	const commentUser = comment.user || {};

	return (
		<div className='flex items-start space-x-3'>
			{commentUser.profilePicture ? (
				<img
					src={commentUser.profilePicture}
					alt={commentUser.name}
					className='w-10 h-10 rounded-full object-cover'
				/>
			) : (
				<div className='w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center'>
					<User className='text-gray-400' />
				</div>
			)}
			<div className='flex-1'>
				<div className='bg-gray-800 p-3 rounded-lg'>
					<div className='flex items-center justify-between'>
						<h4 className='font-bold text-white'>{commentUser.name || "Anonymous"}</h4>
						<span className='text-xs text-gray-400'>{format(new Date(comment.createdAt), "PPP")}</span>
					</div>
					{isTopLevelReview && (
						<div className='flex items-center my-1'>
							{[...Array(5)].map((_, i) => (
								<Star
									key={i}
									size={16}
									className={`${
										i < comment.rating ? "text-yellow-400 fill-current" : "text-gray-600"
									}`}
								/>
							))}
						</div>
					)}
					<p className='text-gray-300 mt-2'>{comment.comment}</p>
				</div>
				<div className='flex items-center space-x-4 mt-2 ml-2 text-sm text-gray-400'>
					<button
						onClick={handleLike}
						className={`flex items-center hover:text-emerald-400 ${
							comment.likes?.includes(user?._id) ? "text-emerald-500" : ""
						}`}
						disabled={!user || likeMutation.isPending}
					>
						<ThumbsUp size={14} className='mr-1' /> {comment.likes?.length || 0}
					</button>
					<button
						onClick={() => setIsReplying(!isReplying)}
						className='flex items-center hover:text-emerald-400'
						disabled={!user}
					>
						<MessageSquare size={14} className='mr-1' /> Reply
					</button>
				</div>

                {isReplying && (
                    <form onSubmit={handleReplySubmit} className='mt-2 ml-2'>
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className='w-full bg-gray-700 text-white rounded-md p-2 text-sm'
                            rows='2'
                            placeholder={`Reply to ${commentUser.name}...`}
                            required
                        ></textarea>
                        <div className="flex justify-end mt-2">
                            <button
                                type="button"
                                onClick={() => setIsReplying(false)}
                                className="text-gray-400 hover:text-white text-sm py-1 px-3 rounded mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-3 rounded text-sm'
                                disabled={replyMutation.isPending}
                            >
                                {replyMutation.isPending ? "Replying..." : "Reply"}
                            </button>
                        </div>
                    </form>
                )}

				{comment.replies && comment.replies.length > 0 && (
					<div className='mt-4 space-y-4 border-l-2 border-gray-700 pl-4'>
						{comment.replies.map((reply) => (
							<Comment key={reply._id} comment={reply} productId={productId} topLevelReviewId={topLevelReviewId} />
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default Comment;