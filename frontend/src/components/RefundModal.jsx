import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import LoadingSpinner from "./LoadingSpinner";

const RefundModal = ({ orderId, onClose }) => {
	const [reason, setReason] = useState("");
	const [proof, setProof] = useState(null);
	const queryClient = useQueryClient();

	const { mutate: requestRefund, isPending } = useMutation({
		mutationFn: (formData) => {
			return axios.post(`/orders/${orderId}/refund`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
		},
		onSuccess: () => {
			toast.success("Refund request submitted successfully.");
			queryClient.invalidateQueries(["order", orderId]);
			onClose();
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to submit refund request.");
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!reason || !proof) {
			toast.error("Please provide a reason and proof for your refund request.");
			return;
		}
		const formData = new FormData();
		formData.append("reason", reason);
		formData.append("proof", proof);
		requestRefund(formData);
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-gray-800 text-white p-6 rounded-lg shadow-xl w-full max-w-md'>
				<h2 className='text-2xl font-bold mb-4'>Request a Refund</h2>
				<form onSubmit={handleSubmit}>
					<div className='mb-4'>
						<label htmlFor='reason' className='block text-sm font-medium text-gray-300 mb-1'>
							Reason for Refund
						</label>
						<textarea
							id='reason'
							rows='4'
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm'
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							required
						/>
					</div>
					<div className='mb-6'>
						<label htmlFor='proof' className='block text-sm font-medium text-gray-300 mb-1'>
							Proof (Image or Video)
						</label>
						<input
							id='proof'
							type='file'
							accept='image/*,video/*'
							className='w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600'
							onChange={(e) => setProof(e.target.files[0])}
							required
						/>
					</div>
					<div className='flex justify-end gap-4'>
						<button
							type='button'
							onClick={onClose}
							className='px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700'
							disabled={isPending}
						>
							Cancel
						</button>
						<button
							type='submit'
							className='px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-500 flex items-center'
							disabled={isPending}
						>
							{isPending ? <LoadingSpinner /> : "Submit Request"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default RefundModal;