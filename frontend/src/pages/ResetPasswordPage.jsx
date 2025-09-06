import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Loader } from "lucide-react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";

const ResetPasswordPage = () => {
	const [formData, setFormData] = useState({
		code: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const [searchParams] = useSearchParams();
	const email = searchParams.get("email");

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (formData.newPassword !== formData.confirmPassword) {
			return toast.error("Passwords do not match");
		}
		setLoading(true);
		setMessage("");
		try {
			await axios.post("/auth/reset-password", {
				email,
				code: formData.code,
				newPassword: formData.newPassword,
			});
			setMessage("Your password has been reset successfully. You can now login.");
			toast.success("Password reset successfully!");
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred");
		} finally {
			setLoading(false);
		}
	};

	if (!email) {
		return (
			<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white'>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-red-500'>Invalid Request</h2>
				<p className='mt-2 text-center text-sm'>No email address provided in the URL.</p>
				<p className='mt-8 text-center text-sm'>
					<Link to='/forgot-password' className='font-medium text-emerald-400 hover:text-emerald-300'>
						Go back to Forgot Password
					</Link>
				</p>
			</div>
		);
	}

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<motion.div
				className='sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-emerald-400'>Reset Your Password</h2>
				<p className='mt-2 text-center text-sm text-gray-400'>
					Enter the code sent to <strong>{email}</strong> and your new password.
				</p>
			</motion.div>

			<motion.div
				className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				<div className='bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10'>
					<form onSubmit={handleSubmit} className='space-y-6'>
						<div>
							<label htmlFor='code' className='block text-sm font-medium text-gray-300'>
								Reset Code
							</label>
							<div className='mt-1'>
								<input
									id='code'
									name='code'
									type='text'
									required
									value={formData.code}
									onChange={handleChange}
									className=' block w-full px-3 py-2 bg-gray-700 border border-gray-600
									rounded-md shadow-sm
									 placeholder-gray-400 focus:outline-none focus:ring-emerald-500
									 focus:border-emerald-500 sm:text-sm'
									placeholder='123456'
								/>
							</div>
						</div>
						<div>
							<label
								htmlFor='newPassword'
								className='block text-sm font-medium text-gray-300'
							>
								New Password
							</label>
							<div className='mt-1'>
								<input
									id='newPassword'
									name='newPassword'
									type='password'
									required
									value={formData.newPassword}
									onChange={handleChange}
									className=' block w-full px-3 py-2 bg-gray-700 border border-gray-600
									rounded-md shadow-sm
									 placeholder-gray-400 focus:outline-none focus:ring-emerald-500
									 focus:border-emerald-500 sm:text-sm'
									placeholder='••••••••'
								/>
							</div>
						</div>
						<div>
							<label
								htmlFor='confirmPassword'
								className='block text-sm font-medium text-gray-300'
							>
								Confirm New Password
							</label>
							<div className='mt-1'>
								<input
									id='confirmPassword'
									name='confirmPassword'
									type='password'
									required
									value={formData.confirmPassword}
									onChange={handleChange}
									className=' block w-full px-3 py-2 bg-gray-700 border border-gray-600
									rounded-md shadow-sm
									 placeholder-gray-400 focus:outline-none focus:ring-emerald-500
									 focus:border-emerald-500 sm:text-sm'
									placeholder='••••••••'
								/>
							</div>
						</div>

						<button
							type='submit'
							className='w-full flex justify-center py-2 px-4 border border-transparent
							rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600
							 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50'
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
									Resetting...
								</>
							) : (
								<>
									<Lock className='mr-2 h-5 w-5' aria-hidden='true' />
									Reset Password
								</>
							)}
						</button>
					</form>
					{message && (
						<p className='mt-4 text-center text-sm text-emerald-400'>
							{message}{" "}
							<Link to='/login' className='font-medium hover:text-emerald-300'>
								Login now.
							</Link>
						</p>
					)}
				</div>
			</motion.div>
		</div>
	);
};

export default ResetPasswordPage;
