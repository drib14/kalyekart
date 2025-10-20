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
		eligibility: "all",
		usageLimitPerUser: 1,
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
		mutationFn: (data) => axios.post("/admin/discounts", data),
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
		mutationFn: (data) => axios.put(`/admin/discounts/${discount._id}`, data),
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
		<div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4'>
			<motion.div
				className='bg-gray-800 border border-emerald-700 p-8 rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto'
				initial={{ opacity: 0, y: -30, scale: 0.95 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: -30, scale: 0.95 }}
				transition={{ duration: 0.3 }}
			>
				<h2 className='text-3xl font-bold text-emerald-400 mb-6 text-center'>
					{discount ? "Edit Discount" : "Create New Discount"}
				</h2>
				<form onSubmit={handleSubmit} className='space-y-6'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<InputField label='Code' name='code' value={formData.code} onChange={handleChange} required />
						<InputField label='Title' name='title' value={formData.title} onChange={handleChange} required />
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
							className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition'
							rows='3'
						/>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<div>
							<label htmlFor='type' className='block text-sm font-medium text-gray-300 mb-1'>
								Type
							</label>
							<select
								name='type'
								id='type'
								value={formData.type}
								onChange={handleChange}
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition'
							>
								<option value='percentage'>Percentage (%)</option>
								<option value='fixed'>Fixed Amount (₱)</option>
								<option value='delivery'>Free Delivery</option>
							</select>
						</div>
						<InputField
							label='Value'
							name='value'
							type='number'
							value={formData.value}
							onChange={handleChange}
							required
						/>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<InputField
							label='Usage Limit Per User'
							name='usageLimitPerUser'
							type='number'
							value={formData.usageLimitPerUser}
							onChange={handleChange}
						/>
						<div>
							<label htmlFor='eligibility' className='block text-sm font-medium text-gray-300 mb-1'>
								Eligibility
							</label>
							<select
								name='eligibility'
								id='eligibility'
								value={formData.eligibility}
								onChange={handleChange}
								className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition'
							>
								<option value='all'>All Users</option>
								<option value='new'>New Users Only</option>
							</select>
						</div>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<InputField
							label='Minimum Order Value (₱)'
							name='minimumOrderValue'
							type='number'
							value={formData.minimumOrderValue}
							onChange={handleChange}
						/>
						<InputField
							label='Usage Limit (0 for unlimited)'
							name='usageLimit'
							type='number'
							value={formData.usageLimit}
							onChange={handleChange}
						/>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						<InputField
							label='Valid From'
							name='validFrom'
							type='date'
							value={formData.validFrom}
							onChange={handleChange}
							required
						/>
						<InputField
							label='Valid Until'
							name='validUntil'
							type='date'
							value={formData.validUntil}
							onChange={handleChange}
							required
						/>
					</div>
					<div className='flex justify-end gap-4 pt-4'>
						<button
							type='button'
							onClick={closeModal}
							className='px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
						>
							Cancel
						</button>
						<button
							type='submit'
							className='px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-emerald-800'
							disabled={isCreating || isUpdating}
						>
							{isCreating || isUpdating ? "Saving..." : "Save Discount"}
						</button>
					</div>
				</form>
			</motion.div>
		</div>
	);
};

const InputField = ({ label, name, ...props }) => (
	<div>
		<label htmlFor={name} className='block text-sm font-medium text-gray-300 mb-1'>
			{label}
		</label>
		<input
			id={name}
			name={name}
			className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition'
			{...props}
		/>
	</div>
);

export default DiscountForm;
