import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "../lib/axios";
import { motion } from "framer-motion";
import { Mail, KeyRound, Lock, Loader } from "lucide-react";

const ResetPasswordPage = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const email = location.state?.email;
	const [code, setCode] = useState("");
	const [password, setPassword] = useState("");

	useEffect(() => {
		if (!email) {
			toast.error("Session expired. Please request a new password reset code.");
			navigate("/forgot-password", { replace: true });
		}
	}, [email, navigate]);

	const { mutate: resetPassword, isPending } = useMutation({
		mutationFn: () => {
			return axios.post("/auth/reset-password", { email, code, password });
		},
		onSuccess: (data) => {
			toast.success(data.data.message);
			navigate("/login");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to reset password.");
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!email) {
			toast.error("No email address provided. Please go back and try again.");
			return;
		}
		if (!code || !password) {
			toast.error("Please fill in all fields.");
			return;
		}
		resetPassword();
	};

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<motion.div
				className='sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-emerald-400'>Reset Your Password</h2>
				<p className='mt-2 text-center text-sm text-gray-400'>
					Enter the code you received and your new password.
				</p>
			</motion.div>

			<motion.div
				className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
			>
				<div className='bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10'>
					<form onSubmit={handleSubmit} className='space-y-6'>
						<div>
							<label htmlFor='email' className='block text-sm font-medium text-gray-300'>
								Email address
							</label>
							<div className='mt-1 relative rounded-lg shadow-sm'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Mail className='h-5 w-5 text-gray-400' aria-hidden='true' />
								</div>
								<p className='block w-full px-3 py-2 pl-10 bg-gray-900 border border-gray-700 rounded-lg text-gray-300'>
									{email || "No email provided"}
								</p>
							</div>
						</div>
						<div>
							<label htmlFor='code' className='block text-sm font-medium text-gray-300'>
								Reset Code
							</label>
							<div className='mt-1 relative rounded-lg shadow-sm'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<KeyRound className='h-5 w-5 text-gray-400' aria-hidden='true' />
								</div>
								<input
									id='code'
									type='text'
									required
									value={code}
									onChange={(e) => setCode(e.target.value)}
									className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg'
									placeholder='6-digit code'
								/>
							</div>
						</div>
						<div>
							<label htmlFor='password' className='block text-sm font-medium text-gray-300'>
								New Password
							</label>
							<div className='mt-1 relative rounded-lg shadow-sm'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
								</div>
								<input
									id='password'
									type='password'
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg'
									placeholder='New password'
								/>
							</div>
						</div>
						<button
							type='submit'
							className='w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700'
							disabled={isPending}
						>
							{isPending ? <Loader className='animate-spin' /> : "Reset Password"}
						</button>
					</form>
				</div>
			</motion.div>
		</div>
	);
};

export default ResetPasswordPage;