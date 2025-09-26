import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { useUserStore } from "../stores/useUserStore";
import LoadingSpinner from "./LoadingSpinner";
import { Building, X } from "lucide-react";

const EditBusinessInfoModal = ({ onClose }) => {
	const { user, setUser } = useUserStore();
	const [storeName, setStoreName] = useState(user?.storeName || "");
	const [storeAddress, setStoreAddress] = useState(user?.storeAddress || "");
	const [operatingHours, setOperatingHours] = useState(user?.operatingHours || "");

	const { mutate: updateBusinessInfo, isPending } = useMutation({
		mutationFn: (formData) => {
			return axios.put("/users/profile", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
		},
		onSuccess: (data) => {
			toast.success("Business info updated successfully");
			setUser(data.data.user);
			onClose();
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to update info");
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append("storeName", storeName);
		formData.append("storeAddress", storeAddress);
		formData.append("operatingHours", operatingHours);
		updateBusinessInfo(formData);
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4'>
			<div className='bg-gray-800 rounded-lg shadow-xl max-w-md w-full relative'>
				<button onClick={onClose} className='absolute top-3 right-3 text-gray-400 hover:text-white'>
					<X size={24} />
				</button>
				<form onSubmit={handleSubmit} className='p-6'>
					<h2 className='text-2xl font-bold text-white mb-6 flex items-center'>
						<Building className='mr-2' /> Edit Business Info
					</h2>
					<div className='space-y-4'>
						<div>
							<label className='block text-sm font-medium text-gray-400 mb-1'>Store Name</label>
							<input
								type='text'
								value={storeName}
								onChange={(e) => setStoreName(e.target.value)}
								className='w-full bg-gray-700 rounded-lg p-2'
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-400 mb-1'>Store Address</label>
							<input
								type='text'
								value={storeAddress}
								onChange={(e) => setStoreAddress(e.target.value)}
								className='w-full bg-gray-700 rounded-lg p-2'
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-400 mb-1'>Operating Hours</label>
							<input
								type='text'
								value={operatingHours}
								onChange={(e) => setOperatingHours(e.target.value)}
								className='w-full bg-gray-700 rounded-lg p-2'
								placeholder='e.g., 9:00 AM - 5:00 PM'
							/>
						</div>
					</div>
					<div className='mt-8 flex justify-end gap-4'>
						<button
							type='button'
							onClick={onClose}
							className='bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg'
						>
							Cancel
						</button>
						<button
							type='submit'
							className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg'
							disabled={isPending}
						>
							{isPending ? <LoadingSpinner /> : "Save Changes"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditBusinessInfoModal;
