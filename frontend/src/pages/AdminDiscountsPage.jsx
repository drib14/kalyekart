import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useState } from "react";
import DiscountForm from "../components/DiscountForm";

const AdminDiscountsPage = () => {
	const queryClient = useQueryClient();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedDiscount, setSelectedDiscount] = useState(null);

	const { data: discounts, isLoading } = useQuery({
		queryKey: ["discounts"],
		queryFn: () => axios.get("/discounts").then((res) => res.data),
	});

	const { mutate: deleteDiscount } = useMutation({
		mutationFn: (id) => axios.delete(`/discounts/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries("discounts");
			toast.success("Discount deleted successfully");
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

	return (
		<main className='container my-10'>
			<motion.div
				className='max-w-6xl mx-auto'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<div className='flex justify-between items-center mb-8'>
					<h1 className='text-3xl font-extrabold text-emerald-400'>Manage Discounts</h1>
					<button
						onClick={() => openModal(null)}
						className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700'
					>
						Create Discount
					</button>
				</div>
				{isLoading ? (
					<LoadingSpinner />
				) : (
					<div className='bg-gray-800 p-6 rounded-lg shadow-lg'>
						<table className='w-full text-left'>
							<thead>
								<tr className='border-b border-gray-700'>
									<th className='p-4'>Code</th>
									<th className='p-4'>Title</th>
									<th className='p-4'>Type</th>
									<th className='p-4'>Value</th>
									<th className='p-4'>Expires</th>
									<th className='p-4'>Actions</th>
								</tr>
							</thead>
							<tbody>
								{discounts.map((discount) => (
									<tr key={discount._id} className='border-b border-gray-700'>
										<td className='p-4'>{discount.code}</td>
										<td className='p-4'>{discount.title}</td>
										<td className='p-4'>{discount.type}</td>
										<td className='p-4'>{discount.value}</td>
										<td className='p-4'>{new Date(discount.validUntil).toLocaleDateString()}</td>
										<td className='p-4'>
											<button
												onClick={() => openModal(discount)}
												className='text-emerald-400 hover:text-emerald-300 mr-4'
											>
												Edit
											</button>
											<button
												onClick={() => deleteDiscount(discount._id)}
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
		</main>
	);
};

export default AdminDiscountsPage;
