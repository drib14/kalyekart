import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";

const RequestRefundModal = ({ orderId, onClose, refetchOrders }) => {
	const [reason, setReason] = useState("");
	const [proof, setProof] = useState(null);

	const { mutate: requestRefund, isPending } = useMutation({
		mutationFn: (formData) => {
			return axios.post(`/orders/${orderId}/refund`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
		},
		onSuccess: () => {
			toast.success("Refund requested successfully");
			refetchOrders();
			onClose();
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append("reason", reason);
		formData.append("proof", proof);
		requestRefund(formData);
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'>
			<div className='bg-gray-800 p-8 rounded-lg shadow-lg max-w-lg w-full'>
				<h2 className='text-2xl font-bold text-white mb-6'>Request Refund</h2>
				<form onSubmit={handleSubmit}>
					<textarea
						rows={4}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
						placeholder='Please provide a reason for the refund'
						required
					/>
					<div className='mt-4'>
						<label htmlFor='proof' className='block text-sm font-medium text-gray-300 mb-1'>
							Proof (Image or Video)
						</label>
						<input
							id='proof'
							type='file'
							accept='image/*,video/*'
							onChange={(e) => setProof(e.target.files[0])}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm'
							required
						/>
					</div>
					<div className='flex justify-end gap-4 mt-6'>
						<button
							type='button'
							onClick={onClose}
							className='bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md'
						>
							Close
						</button>
						<button
							type='submit'
							className='bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md'
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
