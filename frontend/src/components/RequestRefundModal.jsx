import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";

const RequestRefundModal = ({ isOpen, onClose, orderId }) => {
	const [reason, setReason] = useState("");
	const [proof, setProof] = useState(null);
	const queryClient = useQueryClient();

	const { mutate: requestRefund, isPending } = useMutation({
		mutationFn: (formData) => {
			return axios.post(`/api/orders/${orderId}/refund`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
		},
		onSuccess: () => {
			toast.success("Refund request submitted successfully");
			queryClient.invalidateQueries(["orders"]);
			onClose();
		},
		onError: (error) => {
			toast.error(error.response.data.message || "Failed to request refund");
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!reason || !proof) {
			toast.error("Please provide a reason and proof for the refund request");
			return;
		}
		const formData = new FormData();
		formData.append("reason", reason);
		formData.append("proof", proof);
		requestRefund(formData);
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md'>
				<h2 className='text-2xl font-bold text-white mb-4'>Request a Refund</h2>
				<form onSubmit={handleSubmit}>
					<div className='mb-4'>
						<label htmlFor='reason' className='block text-gray-300 mb-2'>
							Reason for refund
						</label>
						<textarea
							id='reason'
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm'
							rows='4'
						></textarea>
					</div>
					<div className='mb-4'>
						<label htmlFor='proof' className='block text-gray-300 mb-2'>
							Proof (Image or Video)
						</label>
						<input
							id='proof'
							type='file'
							accept='image/*,video/*'
							onChange={(e) => setProof(e.target.files[0])}
							className='w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500 file:text-emerald-50 hover:file:bg-emerald-600'
						/>
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
							disabled={isPending}
						>
							{isPending ? "Submitting..." : "Submit Request"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default RequestRefundModal;