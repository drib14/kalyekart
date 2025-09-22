import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";

const CancelOrderModal = ({ orderId, onClose, refetchOrders }) => {
	const [reason, setReason] = useState("");

	const { mutate: cancelOrder, isPending } = useMutation({
		mutationFn: () => {
			return axios.put(`/orders/${orderId}/cancel`, { reason });
		},
		onSuccess: () => {
			toast.success("Order cancelled successfully");
			refetchOrders();
			onClose();
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		cancelOrder();
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center'>
			<div className='bg-gray-800 p-8 rounded-lg shadow-lg max-w-lg w-full'>
				<h2 className='text-2xl font-bold text-white mb-6'>Cancel Order</h2>
				<form onSubmit={handleSubmit}>
					<textarea
						rows={4}
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
						placeholder='Please provide a reason for cancellation'
						required
					/>
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
							className='bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md'
							disabled={isPending}
						>
							{isPending ? "Cancelling..." : "Cancel Order"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CancelOrderModal;
