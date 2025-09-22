import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "../stores/useUserStore";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import { useState } from "react";
import CancelOrderModal from "../components/CancelOrderModal";
import RequestRefundModal from "../components/RequestRefundModal";
import OrdersTab from "../components/OrdersTab";

const MyOrdersPage = () => {
	const { user } = useUserStore();
	const [activeTab, setActiveTab] = useState("orders");
	const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
	const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState(null);

	const {
		data: orders,
		isLoading,
		isError,
		error,
		refetch: refetchOrders,
	} = useQuery({
		queryKey: ["orders", user?._id],
		queryFn: async () => {
			const res = await axios.get("/orders");
			return res.data;
		},
		enabled: !!user,
	});

	if (isLoading) return <LoadingSpinner />;
	if (isError) return <div>Error: {error.message}</div>;

	const openCancelModal = (order) => {
		setSelectedOrder(order);
		setIsCancelModalOpen(true);
	};

	const openRefundModal = (order) => {
		setSelectedOrder(order);
		setIsRefundModalOpen(true);
	};

	return (
		<main className='container my-10'>
			{isCancelModalOpen && (
				<CancelOrderModal
					orderId={selectedOrder._id}
					onClose={() => setIsCancelModalOpen(false)}
					refetchOrders={refetchOrders}
				/>
			)}
			{isRefundModalOpen && (
				<RequestRefundModal
					orderId={selectedOrder._id}
					onClose={() => setIsRefundModalOpen(false)}
					refetchOrders={refetchOrders}
				/>
			)}
			<h1 className='text-3xl font-extrabold text-emerald-400 mb-8 text-center'>My Account</h1>
			<div className='max-w-4xl mx-auto'>
				<div className='flex border-b border-gray-700'>
					<button
						className={`py-2 px-4 ${
							activeTab === "profile" ? "border-b-2 border-emerald-400 text-emerald-400" : "text-gray-400"
						}`}
						onClick={() => setActiveTab("profile")}
					>
						Profile
					</button>
					<button
						className={`py-2 px-4 ${
							activeTab === "orders" ? "border-b-2 border-emerald-400 text-emerald-400" : "text-gray-400"
						}`}
						onClick={() => setActiveTab("orders")}
					>
						Orders
					</button>
					{user.role === "admin" && (
						<button
							className={`py-2 px-4 ${
								activeTab === "admin"
									? "border-b-2 border-emerald-400 text-emerald-400"
									: "text-gray-400"
							}`}
							onClick={() => setActiveTab("admin")}
						>
							Admin
						</button>
					)}
				</div>
				<div className='mt-8'>
					{activeTab === "profile" && (
						<div>
							<h2 className='text-2xl font-bold text-white mb-4'>User Information</h2>
							<div className='bg-gray-800 p-6 rounded-lg shadow-lg'>
								<p className='text-lg'>
									<span className='font-bold text-gray-400'>Name:</span> {user.fullName}
								</p>
								<p className='text-lg'>
									<span className='font-bold text-gray-400'>Email:</span> {user.email}
								</p>
							</div>
						</div>
					)}
					{activeTab === "orders" && <OrdersTab orders={orders} />}
					{activeTab === "admin" && <AdminTab />}
				</div>
			</div>
		</main>
	);
};

const AdminTab = () => {
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

	return (
		<div>
			<h2 className='text-2xl font-bold text-white mb-4'>All Orders</h2>
			<div className='space-y-6'>
				{orders?.map((order) => (
					<div key={order._id} className='bg-gray-800 p-6 rounded-lg shadow-lg'>
						<div className='flex justify-between items-start'>
							<div>
								<p className='text-lg font-bold text-white'>Order ID: {order._id}</p>
								<p className='text-sm text-gray-400'>User: {order.user.fullName}</p>
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

export default MyOrdersPage;
