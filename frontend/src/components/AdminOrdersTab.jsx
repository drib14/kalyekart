import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import { UserCircle, ChevronDown } from "lucide-react";
import RejectionReasonModal from "./RejectionReasonModal";
import ProofViewerModal from "./ProofViewerModal";

const getEffectiveStatus = (order) => {
	if (order.refundRequest) {
		switch (order.refundRequest.status) {
			case "pending":
				return { text: "Refund Requested", color: "bg-blue-500 text-blue-900" };
			case "approved":
				return { text: "Refunded", color: "bg-purple-500 text-purple-900" };
			case "rejected":
				return { text: "Refund Rejected", color: "bg-gray-500 text-gray-900" };
		}
	}
	switch (order.status) {
		case "Pending":
			return { text: "Pending", color: "bg-yellow-500 text-yellow-900" };
		case "Preparing":
			return { text: "Preparing", color: "bg-cyan-500 text-cyan-900" };
		case "Out for Delivery":
			return { text: "Out for Delivery", color: "bg-indigo-500 text-indigo-900" };
		case "Delivered":
			return { text: "Delivered", color: "bg-green-500 text-green-900" };
		case "Cancelled":
			return { text: "Cancelled", color: "bg-red-500 text-red-900" };
		default:
			return { text: order.status, color: "bg-gray-500 text-gray-900" };
	}
};

const AdminOrdersTab = () => {
	const [activeSubTab, setActiveSubTab] = useState("All");
	const [expandedOrderId, setExpandedOrderId] = useState(null);
	const [rejectionModalOrder, setRejectionModalOrder] = useState(null);
	const [proofViewerUrl, setProofViewerUrl] = useState(null);

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
		mutationFn: ({ orderId, status, rejectionReason }) => {
			return axios.put(`/orders/${orderId}/refund/status`, { status, rejectionReason });
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
			return order.status === "Cancelled";
		}
		if (activeSubTab === "Refunds") {
			return order.refundRequest;
		}
		return true;
	});

	const handleRejectSubmit = (rejectionReason) => {
		if (!rejectionModalOrder) return;
		updateRefundStatus({
			orderId: rejectionModalOrder._id,
			status: "rejected",
			rejectionReason,
		});
		setRejectionModalOrder(null);
	};

	return (
		<>
			{rejectionModalOrder && (
				<RejectionReasonModal
					onClose={() => setRejectionModalOrder(null)}
					onSubmit={handleRejectSubmit}
					isPending={false} // You might want to wire this to the mutation's isPending state
				/>
			)}
			{proofViewerUrl && <ProofViewerModal proofUrl={proofViewerUrl} onClose={() => setProofViewerUrl(null)} />}
			<div>
				<div className='flex border-b border-gray-600 mb-4'>
					{["All", "Cancelled", "Refunds"].map((tab) => (
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
					{filteredOrders?.map((order) => {
						const effectiveStatus = getEffectiveStatus(order);
						return (
							<div key={order._id} className='bg-gray-800 p-6 rounded-lg shadow-lg'>
								<div className='flex justify-between items-start'>
									<div className='flex items-center gap-4'>
										{order.user.profilePicture ? (
											<img
												src={order.user.profilePicture}
												alt={order.user.name}
												className='w-12 h-12 rounded-full object-cover'
											/>
										) : (
											<UserCircle className='w-12 h-12 text-gray-500' />
										)}
										<div>
											<p className='text-lg font-bold text-white'>{order.user.name}</p>
											<p className='text-sm text-gray-400'>Order ID: {order._id}</p>
											<p className='text-sm text-gray-400'>
												Placed on: {new Date(order.createdAt).toLocaleDateString()}
											</p>
										</div>
									</div>
									<div className={`px-3 py-1 rounded-full text-sm font-medium ${effectiveStatus.color}`}>
										{effectiveStatus.text}
									</div>
								</div>
								<div className='mt-4'>
									{order.products.map((item) => (
										<div key={item.product?._id} className='flex items-center justify-between py-2'>
											<div>
												<p className='font-medium text-white'>{item.product?.name || "Product not found"}</p>
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

								{expandedOrderId === order._id && (
									<div className='mt-4 border-t border-gray-700 pt-4 space-y-4'>
										<div>
											<h3 className='text-lg font-bold text-white mb-2'>Shipping Details</h3>
											<div className='text-sm text-gray-300'>
												<p>
													<strong>Address:</strong> {order.shippingAddress.streetAddress}, {order.shippingAddress.city},{" "}
													{order.shippingAddress.province}, {order.shippingAddress.postalCode}
												</p>
												<p>
													<strong>Contact:</strong> {order.contactNumber}
												</p>
											</div>
										</div>

										{order.refundRequest && (
											<div className="bg-gray-700 p-4 rounded-lg">
												<h3 className='text-lg font-bold text-white mb-2'>Refund Request</h3>
												<div className="flex justify-between items-center">
													<p>Reason: {order.refundRequest.reason}</p>
													<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEffectiveStatus(order).color}`}>
														{order.refundRequest.status}
													</span>
												</div>

												{order.refundRequest.rejectionReason && (
													<p className='text-sm text-red-400 mt-2'>
														Rejection Reason: {order.refundRequest.rejectionReason}
													</p>
												)}
												<button
													onClick={() => setProofViewerUrl(order.refundRequest.proof)}
													className='text-emerald-400 hover:underline text-sm mt-2'
												>
													View Proof
												</button>

												{order.refundRequest.status === "pending" && (
													<div className='mt-4 flex gap-2'>
														<button
															onClick={() =>
																updateRefundStatus({ orderId: order._id, status: "approved" })
															}
															className='bg-green-600 hover:bg-green-700 text-white py-1 px-2 rounded-md text-xs'
														>
															Approve
														</button>
														<button
															onClick={() => setRejectionModalOrder(order)}
															className='bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded-md text-xs'
														>
															Reject
														</button>
													</div>
												)}
											</div>
										)}
									</div>
								)}

								<div className='mt-4 flex justify-between items-center'>
									<div>
										<button
											onClick={() =>
												setExpandedOrderId(expandedOrderId === order._id ? null : order._id)
											}
											className='flex items-center text-sm text-emerald-400 hover:underline'
										>
											{expandedOrderId === order._id ? "Hide Details" : "View Details"}
											<ChevronDown
												className={`ml-1 h-4 w-4 transition-transform ${
													expandedOrderId === order._id ? "rotate-180" : ""
												}`}
											/>
										</button>
									</div>
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
											<option value='Pending'>Pending</option>
											<option value='Preparing'>Preparing</option>
											<option value='Out for Delivery'>Out for Delivery</option>
											<option value='Delivered'>Delivered</option>
											<option value='Cancelled'>Cancelled</option>
										</select>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			</div>
		</>
	);
};

export default AdminOrdersTab;
