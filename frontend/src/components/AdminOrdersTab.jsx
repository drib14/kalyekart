import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";

const AdminOrdersTab = () => {
    const [activeSubTab, setActiveSubTab] = useState("All");

    const subTabs = ["All", "Cancelled", "Refunds"];

	const {
		data: orders,
		isLoading,
		isError,
		error,
		refetch: refetchOrders,
	} = useQuery({
		queryKey: ["allOrders"],
		queryFn: async () => {
			const res = await axios.get("/orders/all");
			return res.data;
		},
	});

	const { mutate: updateOrderStatus } = useMutation({
		mutationFn: ({ orderId, status }) => {
			return axios.put(`/orders/${orderId}/status`, { status });
		},
		onSuccess: () => {
			toast.success("Order status updated successfully");
			refetchOrders();
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	const { mutate: updateRefundStatus } = useMutation({
		mutationFn: ({ orderId, status }) => {
			return axios.put(`/orders/${orderId}/refund/status`, { status });
		},
		onSuccess: () => {
			toast.success("Refund status updated successfully");
			refetchOrders();
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	if (isLoading) return <LoadingSpinner />;
	if (isError) return <div>Error: {error.message}</div>;

	const filteredOrders = orders?.filter((order) => {
		if (activeSubTab === "Cancelled") {
			return order.status === "cancelled";
		}
		if (activeSubTab === "Refunds") {
			return order.refundRequest;
		}
		return true;
	});

	return (
		<div>
            <div className='flex border-b border-gray-600 mb-4'>
				{subTabs.map((tab) => (
					<button
						key={tab}
						onClick={() => setActiveSubTab(tab)}
						className={`py-2 px-4 text-sm font-medium ${
							activeSubTab === tab
								? "border-b-2 border-emerald-500 text-emerald-400"
								: "text-gray-400 hover:text-white"
						}`}
					>
						{tab}
					</button>
				))}
			</div>
			<h2 className='text-2xl font-bold text-white mb-4'>All Orders</h2>
			<div className='space-y-6'>
				{filteredOrders?.map((order) => (
					<div key={order._id} className='bg-gray-800 p-6 rounded-lg shadow-lg'>
						<div className='flex justify-between items-start'>
							<div>
								<p className='text-lg font-bold text-white'>Order ID: {order._id}</p>
								<p className='text-sm text-gray-400'>User: {order.user.name}</p>
								<p className='text-sm text-gray-400'>
									Placed on: {new Date(order.createdAt).toLocaleDateString()}
								</p>
							</div>
							<div
								className={`px-3 py-1 rounded-full text-sm font-medium ${
									order.status === "pending"
										? "bg-yellow-500 text-yellow-900"
										: order.status === "delivered"
										? "bg-green-500 text-green-900"
										: "bg-red-500 text-red-900"
								}`}
							>
								{order.status}
							</div>
						</div>
						<div className='mt-4'>
							{order.products.map((item) => (
								<div key={item.product._id} className='flex items-center justify-between py-2'>
									<div>
										<p className='font-medium text-white'>{item.product.name}</p>
										<p className='text-sm text-gray-400'>
											{item.quantity} x ₱{item.price.toFixed(2)}
										</p>
									</div>
									<p className='font-medium text-white'>
										₱{(item.quantity * item.price).toFixed(2)}
									</p>
								</div>
							))}
						</div>
						<div className='border-t border-gray-700 my-4' />
						<div className='flex justify-between items-center font-bold text-white'>
							<p>Total</p>
							<p>₱{order.totalAmount.toFixed(2)}</p>
						</div>
						<div className='mt-4 flex justify-between items-center'>
							<div>
								<label htmlFor={`status-${order._id}`} className='text-sm text-gray-400 mr-2'>
									Order Status:
								</label>
								<select
									id={`status-${order._id}`}
									value={order.status}
									onChange={(e) => updateOrderStatus({ orderId: order._id, status: e.target.value })}
									className='bg-gray-700 border border-gray-600 rounded-md shadow-sm'
								>
									<option value='pending'>Pending</option>
									<option value='processing'>Processing</option>
									<option value='shipped'>Shipped</option>
									<option value='delivered'>Delivered</option>
									<option value='cancelled'>Cancelled</option>
								</select>
							</div>
							{order.refundRequest && (
								<div>
									<h3 className='text-lg font-bold text-white'>Refund Request</h3>
									<p>Reason: {order.refundRequest.reason}</p>
									<a
										href={order.refundRequest.proof}
										target='_blank'
										rel='noreferrer'
										className='text-emerald-400 hover:underline'
									>
										View Proof
									</a>
									<div className='flex gap-2 mt-2'>
										<button
											onClick={() =>
												updateRefundStatus({ orderId: order._id, status: "approved" })
											}
											className='bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded-md'
										>
											Approve
										</button>
										<button
											onClick={() =>
												updateRefundStatus({ orderId: order._id, status: "rejected" })
											}
											className='bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded-md'
										>
											Reject
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default AdminOrdersTab;
