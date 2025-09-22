import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "../stores/useUserStore";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import { useState } from "react";
import CancelOrderModal from "../components/CancelOrderModal";
import RequestRefundModal from "../components/RequestRefundModal";
import OrdersTab from "../components/OrdersTab";
import Pagination from "../components/Pagination";

const MyOrdersPage = () => {
	const { user } = useUserStore();
	const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
	const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;

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

	const totalPages = orders ? Math.ceil(orders.length / itemsPerPage) : 0;
	const handlePageChange = (pageNumber) => {
		if (pageNumber > 0 && pageNumber <= totalPages) {
			setCurrentPage(pageNumber);
		}
	};

	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentOrders = orders ? orders.slice(indexOfFirstItem, indexOfLastItem) : [];

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
			<h1 className='text-3xl font-extrabold text-emerald-400 mb-8 text-center'>My Orders</h1>
			<div className='max-w-4xl mx-auto'>
				<OrdersTab
					orders={currentOrders}
					openCancelModal={openCancelModal}
					openRefundModal={openRefundModal}
				/>
				{totalPages > 1 && (
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={handlePageChange}
					/>
				)}
			</div>
		</main>
	);
};

export default MyOrdersPage;
