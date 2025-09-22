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
				</div>
				<div className='mt-8'>
					{activeTab === "profile" && (
						<div>
							<h2 className='text-2xl font-bold text-white mb-4'>User Information</h2>
							<div className='bg-gray-800 p-6 rounded-lg shadow-lg'>
								<p className='text-lg'>
									<span className='font-bold text-gray-400'>Name:</span> {user.name}
								</p>
								<p className='text-lg'>
									<span className='font-bold text-gray-400'>Email:</span> {user.email}
								</p>
							</div>
						</div>
					)}
					{activeTab === "orders" && (
						<OrdersTab orders={orders} openCancelModal={openCancelModal} openRefundModal={openRefundModal} />
					)}
				</div>
			</div>
		</main>
	);
};

export default MyOrdersPage;
