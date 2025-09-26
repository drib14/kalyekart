import { useState, useRef, useEffect } from "react";
import { User, Building, Mail, Phone, Clock, BarChart, Camera, Save, Edit } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "../stores/useUserStore";
import { useMutation } from "@tanstack/react-query";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import EditBusinessInfoModal from "../components/EditBusinessInfoModal";

const AdminProfilePage = () => {
	const { user, setUser } = useUserStore();
	const [name, setName] = useState(user?.name || "");
	const [email, setEmail] = useState(user?.email || "");
	const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
	const [profilePicture, setProfilePicture] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || null);
	const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
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
		onSuccess: (data) => {
			toast.success("Profile updated successfully");
			setUser(data.data.user);
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

	const handleNotImplemented = () => {
		toast.info("This feature is not yet implemented.");
	};

	return (
		<div className='min-h-screen bg-gray-900 text-white'>
			<div className='container mx-auto p-4 sm:p-6 md:p-8'>
				<form onSubmit={handleSubmit} className='max-w-4xl mx-auto'>
					{/* Header */}
					<div className='flex flex-col sm:flex-row items-center gap-6 mb-8'>
						<div className='relative'>
							{previewUrl ? (
								<img
									src={previewUrl}
									alt='Admin'
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
							<h1 className='text-3xl sm:text-4xl font-bold'>{user?.name}</h1>
							<p className='text-emerald-400'>{user?.role}</p>
						</div>
					</div>

					{/* Profile Sections */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
						{/* Basic Info */}
						<div className='bg-gray-800 p-6 rounded-lg'>
							<h2 className='text-xl font-semibold mb-4 flex items-center'><User className="mr-2"/> Basic Info</h2>
							<div className='space-y-4'>
								<div>
									<label className='block text-sm font-medium text-gray-400 mb-1'>Name</label>
									<input
										type='text'
										value={name}
										onChange={(e) => setName(e.target.value)}
										className='w-full bg-gray-700 rounded-lg p-2'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-400 mb-1'>Email</label>
									<input
										type='email'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className='w-full bg-gray-700 rounded-lg p-2'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-400 mb-1'>Phone</label>
									<input
										type='tel'
										value={phoneNumber}
										onChange={(e) => setPhoneNumber(e.target.value)}
										placeholder='e.g., 09123456789'
										className='w-full bg-gray-700 rounded-lg p-2'
									/>
								</div>
							</div>
						</div>

						{/* Business Info */}
						<div className='bg-gray-800 p-6 rounded-lg'>
							<div className='flex justify-between items-center mb-4'>
								<h2 className='text-xl font-semibold flex items-center'><Building className="mr-2"/> Business Info</h2>
								<button type="button" onClick={() => setIsBusinessModalOpen(true)} className="text-emerald-400 hover:text-emerald-300">
									<Edit size={18} />
								</button>
							</div>
							<div className='space-y-3'>
								<p><strong>Store Name:</strong> {user?.storeName || "Not set"}</p>
								<p><strong>Address:</strong> {user?.storeAddress || "Not set"}</p>
								<p><Clock className="inline mr-2"/> {user?.operatingHours || "Not set"}</p>
							</div>
						</div>

						{/* Quick Stats */}
						<div className='bg-gray-800 p-6 rounded-lg md:col-span-2'>
							<h2 className='text-xl font-semibold mb-4 flex items-center'><BarChart className="mr-2"/> Quick Stats</h2>
							<p className='text-gray-500 italic'>Coming soon...</p>
						</div>
					</div>

					<div className='mt-8 flex justify-end'>
						<button
							type='submit'
							className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg flex items-center'
							disabled={isPending}
						>
							{isPending ? <LoadingSpinner size="sm" /> : <><Save className="mr-2"/> Save Changes</>}
						</button>
					</div>
				</form>
				{isBusinessModalOpen && <EditBusinessInfoModal onClose={() => setIsBusinessModalOpen(false)} />}
			</div>
		</div>
	);
};

export default AdminProfilePage;
