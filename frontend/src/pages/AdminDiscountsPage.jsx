import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useState } from "react";
import DiscountForm from "../components/DiscountForm";
import ConfirmationModal from "../components/ConfirmationModal";

const AdminDiscountsPage = () => {
	const queryClient = useQueryClient();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedDiscount, setSelectedDiscount] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [discountToDelete, setDiscountToDelete] = useState(null);

	const { data: discounts, isLoading } = useQuery({
		queryKey: ["discounts"],
		queryFn: () => axios.get("/admin/discounts").then((res) => res.data),
	});

	const { mutate: deleteDiscount } = useMutation({
		mutationFn: (id) => axios.delete(`/admin/discounts/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries("discounts");
			toast.success("Discount deleted successfully");
			setIsDeleteModalOpen(false);
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	const openModal = (discount) => {
		setSelectedDiscount(discount);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setSelectedDiscount(null);
		setIsModalOpen(false);
	};

	const openDeleteModal = (discount) => {
		setDiscountToDelete(discount);
		setIsDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		setDiscountToDelete(null);
		setIsDeleteModalOpen(false);
	};

	return (
		<main className='container my-10'>
			<motion.div
				className='max-w-7xl mx-auto'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<div className='flex justify-between items-center mb-8'>
					<h1 className='text-3xl font-extrabold text-emerald-400'>Manage Discounts</h1>
					<button
						onClick={() => openModal(null)}
						className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors'
					>
						Create Discount
					</button>
				</div>
				{isLoading ? (
					<LoadingSpinner />
				) : (
					<div className='bg-gray-800 p-6 rounded-lg shadow-lg overflow-x-auto'>
						<table className='w-full text-left'>
							<thead>
								<tr className='border-b border-gray-700'>
									<th className='p-4'>Code</th>
									<th className='p-4'>Title</th>
									<th className='p-4'>Type</th>
									<th className='p-4'>Value</th>
									<th className='p-4'>Min. Order</th>
									<th className='p-4'>Usage</th>
									<th className='p-4'>Expires</th>
									<th className='p-4'>Status</th>
									<th className='p-4'>Actions</th>
								</tr>
							</thead>
							<tbody>
								{discounts.map((discount) => (
									<tr key={discount._id} className='border-b border-gray-700 hover:bg-gray-700/50'>
										<td className='p-4 font-mono bg-gray-900 rounded-l-lg'>{discount.code}</td>
										<td className='p-4'>{discount.title}</td>
										<td className='p-4'>{discount.type}</td>
										<td className='p-4'>
											{discount.type === "percentage"
												? `${discount.value}%`
												: `₱${(discount.value || 0).toFixed(2)}`}
										</td>
										<td className='p-4'>₱{(discount.minimumOrderValue || 0).toFixed(2)}</td>
										<td className='p-4'>
											{discount.timesUsed} / {discount.usageLimit || "∞"}
										</td>
										<td className='p-4'>{new Date(discount.validUntil).toLocaleDateString()}</td>
										<td className='p-4'>
											<span
												className={`px-2 py-1 rounded-full text-xs ${
													discount.status === "active"
														? "bg-emerald-500 text-white"
														: "bg-gray-600 text-gray-300"
												}`}
											>
												{discount.status}
											</span>
										</td>
										<td className='p-4 rounded-r-lg'>
											<button
												onClick={() => openModal(discount)}
												className='text-emerald-400 hover:text-emerald-300 mr-4'
											>
												Edit
											</button>
											<button
												onClick={() => openDeleteModal(discount)}
												className='text-red-500 hover:text-red-400'
											>
												Delete
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</motion.div>
			{isModalOpen && <DiscountForm discount={selectedDiscount} closeModal={closeModal} />}
			{isDeleteModalOpen && (
				<ConfirmationModal
					isOpen={isDeleteModalOpen}
					message={`Are you sure you want to delete the discount "${discountToDelete?.code}"?`}
					onConfirm={() => deleteDiscount(discountToDelete?._id)}
					onClose={closeDeleteModal}
				/>
			)}
		</main>
	);
};

export default AdminDiscountsPage;
