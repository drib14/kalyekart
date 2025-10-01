import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { PlusCircle, Edit, Trash, Save, X, MapPin } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const DeliveryAddressManager = () => {
	const queryClient = useQueryClient();
	const [isAdding, setIsAdding] = useState(false);
	const [editingAddressId, setEditingAddressId] = useState(null);

	const {
		data: addresses,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["deliveryAddresses"],
		queryFn: () => axios.get("/users/addresses").then((res) => res.data),
	});

	const addMutation = useMutation({
		mutationFn: (newAddress) => axios.post("/users/addresses", newAddress),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deliveryAddresses"] });
			toast.success("Address added successfully");
			setIsAdding(false);
		},
		onError: () => toast.error("Failed to add address"),
	});

	const updateMutation = useMutation({
		mutationFn: ({ addressId, updatedAddress }) =>
			axios.put(`/users/addresses/${addressId}`, updatedAddress),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deliveryAddresses"] });
			toast.success("Address updated successfully");
			setEditingAddressId(null);
		},
		onError: () => toast.error("Failed to update address"),
	});

	const deleteMutation = useMutation({
		mutationFn: (addressId) => axios.delete(`/users/addresses/${addressId}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deliveryAddresses"] });
			toast.success("Address deleted successfully");
		},
		onError: () => toast.error("Failed to delete address"),
	});

	const setDefaultMutation = useMutation({
		mutationFn: (addressId) => axios.patch(`/users/addresses/${addressId}/set-default`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["deliveryAddresses"] });
			toast.success("Default address updated");
		},
		onError: () => toast.error("Failed to set default address"),
	});

	return (
		<div className='bg-gray-800 p-6 rounded-lg'>
			<h2 className='text-xl font-semibold mb-4 flex items-center'>
				<MapPin className='mr-2' /> Manage Delivery Addresses
			</h2>

			{isLoading && (
				<div className='flex justify-center'>
					<LoadingSpinner />
				</div>
			)}

			{isError && <p className='text-red-400 text-center'>Could not load addresses.</p>}

			{!isLoading && !isError && addresses && (
				<div className='space-y-4'>
					{addresses.map((address) => (
						<Address
							key={address._id}
							address={address}
							isEditing={editingAddressId === address._id}
							onEdit={() => setEditingAddressId(address._id)}
							onCancel={() => setEditingAddressId(null)}
							onSave={(updatedAddress) =>
								updateMutation.mutate({ addressId: address._id, updatedAddress })
							}
							onDelete={() => deleteMutation.mutate(address._id)}
							onSetDefault={() => setDefaultMutation.mutate(address._id)}
							isUpdating={updateMutation.isPending}
							isDeleting={deleteMutation.isPending}
							isSettingDefault={setDefaultMutation.isPending}
						/>
					))}
				</div>
			)}

			{isAdding ? (
				<AddressForm
					onSave={(newAddress) => addMutation.mutate(newAddress)}
					onCancel={() => setIsAdding(false)}
					isSaving={addMutation.isPending}
				/>
			) : (
				<button
					onClick={() => setIsAdding(true)}
					className='mt-4 flex items-center text-emerald-400 hover:text-emerald-300'
				>
					<PlusCircle className='mr-2' /> Add New Address
				</button>
			)}
		</div>
	);
};

const Address = ({
	address,
	isEditing,
	onEdit,
	onCancel,
	onSave,
	onDelete,
	onSetDefault,
	isUpdating,
	isDeleting,
	isSettingDefault,
}) => {
	if (isEditing) {
		return <AddressForm initialData={address} onSave={onSave} onCancel={onCancel} isSaving={isUpdating} />;
	}

	return (
		<div
			className={`p-4 rounded-lg flex justify-between items-start ${
				address.isDefault ? "bg-emerald-900/50 border border-emerald-500" : "bg-gray-700"
			}`}
		>
			<div>
				<p className='font-bold'>{address.fullName}</p>
				<p>{address.address}</p>
				<p>
					{address.city}, {address.postalCode}
				</p>
				<p>{address.country}</p>
				{address.isDefault && (
					<span className='text-xs bg-emerald-500 text-white font-bold px-2 py-1 rounded-full mt-2 inline-block'>
						Default
					</span>
				)}
			</div>
			<div className='flex flex-col space-y-2'>
				<div className='flex space-x-2'>
					<button onClick={onEdit} className='text-gray-400 hover:text-white'>
						<Edit size={18} />
					</button>
					<button
						onClick={onDelete}
						disabled={isDeleting}
						className='text-gray-400 hover:text-red-500'
					>
						<Trash size={18} />
					</button>
				</div>
				{!address.isDefault && (
					<button
						onClick={onSetDefault}
						disabled={isSettingDefault}
						className='text-sm text-emerald-400 hover:text-emerald-300 disabled:opacity-50'
					>
						Set as Default
					</button>
				)}
			</div>
		</div>
	);
};

const AddressForm = ({ onSave, onCancel, initialData = {}, isSaving }) => {
	const [formData, setFormData] = useState({
		fullName: initialData.fullName || "",
		address: initialData.address || "",
		city: initialData.city || "",
		postalCode: initialData.postalCode || "",
		country: initialData.country || "Philippines",
	});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSave(formData);
	};

	return (
		<form onSubmit={handleSubmit} className='p-4 bg-gray-700 rounded-lg mt-4 space-y-3'>
			<input
				name='fullName'
				value={formData.fullName}
				onChange={handleChange}
				placeholder='Full Name'
				className='w-full bg-gray-600 rounded p-2'
				required
			/>
			<input
				name='address'
				value={formData.address}
				onChange={handleChange}
				placeholder='Street Address'
				className='w-full bg-gray-600 rounded p-2'
				required
			/>
			<div className='flex space-x-2'>
				<input
					name='city'
					value={formData.city}
					onChange={handleChange}
					placeholder='City'
					className='w-1/2 bg-gray-600 rounded p-2'
					required
				/>
				<input
					name='postalCode'
					value={formData.postalCode}
					onChange={handleChange}
					placeholder='Postal Code'
					className='w-1/2 bg-gray-600 rounded p-2'
					required
				/>
			</div>
			<input
				name='country'
				value={formData.country}
				onChange={handleChange}
				placeholder='Country'
				className='w-full bg-gray-600 rounded p-2'
				required
			/>
			<div className='flex justify-end space-x-2'>
				<button type='button' onClick={onCancel} className='p-2 text-gray-400 hover:text-white'>
					<X size={20} />
				</button>
				<button type='submit' disabled={isSaving} className='p-2 text-emerald-400 hover:text-white'>
					<Save size={20} />
				</button>
			</div>
		</form>
	);
};

export default DeliveryAddressManager;