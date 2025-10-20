import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { motion } from "framer-motion";

const DiscountForm = ({ discount, closeModal }) => {
	const queryClient = useQueryClient();
	const [formData, setFormData] = useState({
		code: "",
		title: "",
		description: "",
		type: "percentage",
		value: 0,
		minimumOrderValue: 0,
		validFrom: "",
		validUntil: "",
		usageLimit: null,
	});

	useEffect(() => {
		if (discount) {
			setFormData({
				...discount,
				validFrom: discount.validFrom.split("T")[0],
				validUntil: discount.validUntil.split("T")[0],
			});
		}
	}, [discount]);

	const { mutate: createDiscount, isPending: isCreating } = useMutation({
		mutationFn: (data) => axios.post("/discounts", data),
		onSuccess: () => {
			queryClient.invalidateQueries("discounts");
			toast.success("Discount created successfully");
			closeModal();
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	const { mutate: updateDiscount, isPending: isUpdating } = useMutation({
		mutationFn: (data) => axios.put(`/discounts/${discount._id}`, data),
		onSuccess: () => {
			queryClient.invalidateQueries("discounts");
			toast.success("Discount updated successfully");
			closeModal();
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (discount) {
			updateDiscount(formData);
		} else {
			createDiscount(formData);
		}
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<motion.div
				className='bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<h2 className='text-2xl font-bold text-white mb-6'>{discount ? "Edit Discount" : "Create Discount"}</h2>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label htmlFor='code' className='block text-sm font-medium text-gray-300 mb-1'>
								Code
							</label>
							<input
								type='text'
								name='code'
								id='code'
								value={formData.code}
								onChange={handleChange}
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
								required
							/>
						</div>
						<div>
							<label htmlFor='title' className='block text-sm font-medium text-gray-300 mb-1'>
								Title
							</label>
							<input
								type='text'
								name='title'
								id='title'
								value={formData.title}
								onChange={handleChange}
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
								required
							/>
						</div>
					</div>
					<div>
						<label htmlFor='description' className='block text-sm font-medium text-gray-300 mb-1'>
							Description
						</label>
						<textarea
							name='description'
							id='description'
							value={formData.description}
							onChange={handleChange}
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
						/>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label htmlFor='type' className='block text-sm font-medium text-gray-300 mb-1'>
								Type
							</label>
							<select
								name='type'
								id='type'
								value={formData.type}
								onChange={handleChange}
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
							>
								<option value='percentage'>Percentage</option>
								<option value='fixed'>Fixed</option>
							</select>
						</div>
						<div>
							<label htmlFor='value' className='block text-sm font-medium text-gray-300 mb-1'>
								Value
							</label>
							<input
								type='number'
								name='value'
								id='value'
								value={formData.value}
								onChange={handleChange}
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
								required
							/>
						</div>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label htmlFor='minimumOrderValue' className='block text-sm font-medium text-gray-300 mb-1'>
								Minimum Order Value
							</label>
							<input
								type='number'
								name='minimumOrderValue'
								id='minimumOrderValue'
								value={formData.minimumOrderValue}
								onChange={handleChange}
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
							/>
						</div>
						<div>
							<label htmlFor='usageLimit' className='block text-sm font-medium text-gray-300 mb-1'>
								Usage Limit
							</label>
							<input
								type='number'
								name='usageLimit'
								id='usageLimit'
								value={formData.usageLimit}
								onChange={handleChange}
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
							/>
						</div>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label htmlFor='validFrom' className='block text-sm font-medium text-gray-300 mb-1'>
								Valid From
							</label>
							<input
								type='date'
								name='validFrom'
								id='validFrom'
								value={formData.validFrom}
								onChange={handleChange}
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
								required
							/>
						</div>
						<div>
							<label htmlFor='validUntil' className='block text-sm font-medium text-gray-300 mb-1'>
								Valid Until
							</label>
							<input
								type='date'
								name='validUntil'
								id='validUntil'
								value={formData.validUntil}
								onChange={handleChange}
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
								required
							/>
						</div>
					</div>
					<div className='flex justify-end gap-4'>
						<button
							type='button'
							onClick={closeModal}
							className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700'
						>
							Cancel
						</button>
						<button
							type='submit'
							className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700'
							disabled={isCreating || isUpdating}
						>
							{isCreating || isUpdating ? "Saving..." : "Save"}
						</button>
					</div>
				</form>
			</motion.div>
		</div>
	);
};

export default DiscountForm;
