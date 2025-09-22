import { useState, useRef } from "react";
import { User, Mail, Phone, MapPin, CreditCard, ShoppingBag, Heart, Lock, Bell, HelpCircle, Camera, Save } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "../stores/useUserStore";
import { useMutation } from "@tanstack/react-query";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";

const CustomerProfilePage = () => {
	const { user, setUser } = useUserStore();
	const [name, setName] = useState(user?.name || "");
	const [email, setEmail] = useState(user?.email || "");
	const [profilePicture, setProfilePicture] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || "https://via.placeholder.com/150");
	const fileInputRef = useRef(null);

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
							<img
								src={previewUrl}
								alt='Customer'
								className='w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-emerald-500 object-cover'
							/>
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
							>
								<Camera size={18} />
							</button>
						</div>
						<div>
							<h1 className='text-3xl sm:text-4xl font-bold'>{user?.name}</h1>
							<p className='text-gray-400'>{user?.email}</p>
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
										className='w-full bg-gray-700 rounded-md p-2'
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-gray-400 mb-1'>Email</label>
									<input
										type='email'
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className='w-full bg-gray-700 rounded-md p-2'
									/>
								</div>
							</div>
						</div>

						{/* Delivery & Payment */}
						<div className='bg-gray-800 p-6 rounded-lg'>
							<h2 className='text-xl font-semibold mb-4 flex items-center'><MapPin className="mr-2"/> Delivery & Payment</h2>
							<div className='space-y-3'>
								<button onClick={handleNotImplemented} type="button" className='flex items-center w-full text-left hover:text-emerald-400'><MapPin className="mr-2"/> Manage Delivery Addresses</button>
								<button onClick={handleNotImplemented} type="button" className='flex items-center w-full text-left hover:text-emerald-400'><CreditCard className="mr-2"/> Manage Payment Methods</button>
							</div>
						</div>

						{/* Order Activity */}
						<div className='bg-gray-800 p-6 rounded-lg md:col-span-2'>
							<h2 className='text-xl font-semibold mb-4 flex items-center'><ShoppingBag className="mr-2"/> Order Activity</h2>
							<div className='space-y-3'>
								<button onClick={handleNotImplemented} type="button" className='flex items-center w-full text-left hover:text-emerald-400'><ShoppingBag className="mr-2"/> View Recent Orders</button>
								<button onClick={handleNotImplemented} type="button" className='flex items-center w-full text-left hover:text-emerald-400'><Heart className="mr-2"/> Favorite Items</button>
							</div>
						</div>

						{/* Account Settings */}
						<div className='bg-gray-800 p-6 rounded-lg'>
							<h2 className='text-xl font-semibold mb-4 flex items-center'><Settings className="mr-2"/> Account Settings</h2>
							<div className='space-y-3'>
								<button onClick={handleNotImplemented} type="button" className='flex items-center w-full text-left hover:text-emerald-400'><Lock className="mr-2"/> Change Password</button>
								<button onClick={handleNotImplemented} type="button" className='flex items-center w-full text-left hover:text-emerald-400'><Bell className="mr-2"/> Manage Notifications</button>
								<button onClick={handleNotImplemented} type="button" className='flex items-center w-full text-left hover:text-emerald-400'><HelpCircle className="mr-2"/> Support Center</button>
							</div>
						</div>
					</div>

					<div className='mt-8 flex justify-end'>
						<button
							type='submit'
							className='bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg flex items-center'
							disabled={isPending}
						>
							{isPending ? <LoadingSpinner /> : <><Save className="mr-2"/> Save Changes</>}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default CustomerProfilePage;
