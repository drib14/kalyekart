import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import Confetti from "react-confetti";
import { useUserStore } from "../stores/useUserStore";

const FeedbackModal = ({ isOpen, onClose }) => {
	const { user } = useUserStore();
	const [rating, setRating] = useState(0);
	const [feedback, setFeedback] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const mutation = useMutation({
		mutationFn: (newFeedback) => {
			return axios.post("/feedback", newFeedback);
		},
		onSuccess: () => {
			setSubmitted(true);
		},
		onError: () => {
			toast.error("Failed to submit feedback. Please try again later.");
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!user) {
			toast.error("You must be logged in to submit feedback.");
			return;
		}
		mutation.mutate({
			rating,
			feedback,
			user: {
				name: user.name,
				email: user.email,
			},
		});
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md'>
				{submitted ? (
					<div className='text-center'>
						<Confetti width={400} height={400} />
						<h2 className='text-2xl font-bold text-white mb-4'>Thank You!</h2>
						<p className='text-gray-300'>Your feedback has been submitted successfully.</p>
						<button
							onClick={() => {
								setSubmitted(false);
								onClose();
							}}
							className='mt-4 bg-emerald-500 text-white rounded-md px-4 py-2'
						>
							Close
						</button>
					</div>
				) : (
					<>
						<h2 className='text-2xl font-bold text-white mb-4'>Your Feedback Matters</h2>
						<p className='text-gray-300 mb-6'>
							Your feedback helps us improve the app. Please let us know what you think.
						</p>
						<form onSubmit={handleSubmit}>
							<div className='mb-4'>
								<label className='block text-gray-300 mb-2'>Rating</label>
								<div className='flex'>
									{[1, 2, 3, 4, 5].map((star) => (
										<svg
											key={star}
											onClick={() => setRating(star)}
											className={`h-8 w-8 cursor-pointer ${
												rating >= star ? "text-yellow-400" : "text-gray-500"
											}`}
											fill='currentColor'
											viewBox='0 0 20 20'
										>
											<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.16c.969 0 1.371 1.24.588 1.81l-3.363 2.44a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.539 1.118l-3.362-2.44a1 1 0 00-1.176 0l-3.362 2.44c-.783.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.24 9.384c-.783-.57-.38-1.81.588-1.81h4.16a1 1 0 00.95-.69L9.049 2.927z' />
										</svg>
									))}
								</div>
							</div>
							<div className='mb-6'>
								<label htmlFor='feedback' className='block text-gray-300 mb-2'>
									Feedback
								</label>
								<textarea
									id='feedback'
									value={feedback}
									onChange={(e) => setFeedback(e.target.value)}
									className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm'
									rows='4'
								></textarea>
							</div>
							<div className='flex justify-end'>
								<button
									type='button'
									onClick={onClose}
									className='mr-4 bg-gray-600 text-white rounded-md px-4 py-2'
								>
									Cancel
								</button>
								<button
									type='submit'
									className='bg-emerald-500 text-white rounded-md px-4 py-2'
									disabled={mutation.isPending}
								>
									{mutation.isPending ? "Submitting..." : "Submit"}
								</button>
							</div>
						</form>
					</>
				)}
			</div>
		</div>
	);
};

export default FeedbackModal;