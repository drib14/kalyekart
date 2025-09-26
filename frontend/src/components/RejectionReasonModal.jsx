import { useState } from "react";

const RejectionReasonModal = ({ onSubmit, onClose, isPending }) => {
	const [reason, setReason] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!reason) return;
		onSubmit(reason);
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4'>
			<div className='bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm sm:max-w-md w-full'>
				<h2 className='text-xl sm:text-2xl font-bold text-white mb-4'>Rejection Reason</h2>
				<form onSubmit={handleSubmit}>
					<textarea
						rows={4}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 text-sm'
						placeholder='Please provide a reason for rejecting the refund request...'
						required
					/>
					<div className='flex justify-end gap-2 sm:gap-4 mt-4'>
						<button
							type='button'
							onClick={onClose}
							className='bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 sm:px-4 rounded-lg text-sm'
						>
							Cancel
						</button>
						<button
							type='submit'
							className='bg-red-600 hover:bg-red-700 text-white py-2 px-3 sm:px-4 rounded-lg text-sm'
							disabled={isPending}
						>
							{isPending ? "Submitting..." : "Submit Rejection"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default RejectionReasonModal;
