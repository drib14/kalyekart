import { useState, useRef, useEffect } from "react";
import { User, Camera, Save, Truck } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "../stores/useUserStore";
import { useMutation } from "@tanstack/react-query";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";

const DriverProfilePage = () => {
	const { user, checkAuth } = useUserStore();
	const [name, setName] = useState(user?.name || "");
	const [email, setEmail] = useState(user?.email || "");
	const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
	const [profilePicture, setProfilePicture] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || null);
	const fileInputRef = useRef(null);

	useEffect(() => {
		if (user?.profilePicture) {
			setPreviewUrl(user.profilePicture);
		}
	}, [user?.profilePicture]);

	const { mutate: updateProfile, isPending } = useMutation({
		mutationFn: (formData) => {
			return axios.put("/users/profile", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
		},
		onSuccess: () => {
			toast.success("Profile updated successfully");
			checkAuth();
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to update profile");
		},
	});

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setProfilePicture(file);
			setPreviewUrl(URL.createObjectURL(file));
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append("name", name);
		formData.append("email", email);
		formData.append("phoneNumber", phoneNumber);
		if (profilePicture) {
			formData.append("profilePicture", profilePicture);
		}
		updateProfile(formData);
	};

	return (
		<div className='min-h-screen bg-gray-900 text-white'>
			<div className='container mx-auto p-4 sm:p-6 md:p-8'>
				<div className='max-w-4xl mx-auto'>
					{/* Header */}
					<div className='flex flex-col sm:flex-row items-center gap-6 mb-8'>
						<div className='relative'>
							{previewUrl ? (
								<img
									src={previewUrl}
									alt='Driver'
									className='w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-emerald-500 object-cover'
								/>
							) : (
								<User className='w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-emerald-500 bg-gray-700 p-4' />
							)}
							<input
								type='file'
								ref={fileInputRef}
								onChange={handleFileChange}
								className='hidden'
								accept='image/*'
							/>
							<button
								type='button'
								onClick={() => fileInputRef.current.click()}
								className='absolute bottom-0 right-0 bg-emerald-600 p-2 rounded-full hover:bg-emerald-700'
								title='Change profile picture'
							>
								<Camera size={18} />
							</button>
						</div>
						<div>
							<div className="flex items-center gap-2">
								<h1 className='text-3xl sm:text-4xl font-bold'>{user?.name}</h1>
								<span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs uppercase font-bold flex items-center">
									<Truck size={12} className="mr-1" /> Driver
								</span>
							</div>
							<p className='text-gray-400'>{user?.email}</p>
						</div>
					</div>

					{/* Profile Sections */}
					<div className='space-y-8'>
						{/* Basic Info Form */}
						<form onSubmit={handleSubmit} className='bg-gray-800 p-6 rounded-lg border border-gray-700'>
							<h2 className='text-xl font-semibold mb-4 flex items-center text-emerald-400'><User className="mr-2"/> Driver Information</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gray-400 mb-1'>Name</label>
									<input
										type='text'
										value={name}
										onChange={(e) => setName(e.target.value)}
										className='w-full bg-gray-700 rounded-lg p-2 border border-gray-600 focus:border-emerald-500 outline-none'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-400 mb-1'>Email</label>
									<input
										type='email'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className='w-full bg-gray-700 rounded-lg p-2 border border-gray-600 focus:border-emerald-500 outline-none'
									/>
								</div>
								<div className='md:col-span-2'>
									<label className='block text-sm font-medium text-gray-400 mb-1'>Phone Number</label>
									<input
										type='tel'
										value={phoneNumber}
										onChange={(e) => setPhoneNumber(e.target.value)}
										className='w-full bg-gray-700 rounded-lg p-2 border border-gray-600 focus:border-emerald-500 outline-none'
										placeholder='e.g., 09123456789'
									/>
								</div>
							</div>
							<div className='mt-6 flex justify-end'>
								<button
									type='submit'
									className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg flex items-center transition-colors'
									disabled={isPending}
								>
									{isPending ? <LoadingSpinner size="sm" /> : <><Save className="mr-2"/> Save Changes</>}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DriverProfilePage;
