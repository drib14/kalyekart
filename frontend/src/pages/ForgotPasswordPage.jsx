import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion } from "framer-motion";
import { Mail, KeyRound, Lock } from "lucide-react";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [code, setCode] = useState("");
	const [password, setPassword] = useState("");
	const [step, setStep] = useState(1); // 1 for email input, 2 for code and new password
	const navigate = useNavigate();

	const { mutate: requestPasswordReset, isPending: isRequesting } = useMutation({
		mutationFn: () => {
			return axios.post("/auth/forgot-password", { email });
		},
		onSuccess: (data) => {
			toast.success(data.data.message);
			setStep(2);
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to request password reset.");
		},
	});

	const { mutate: resetPassword, isPending: isResetting } = useMutation({
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

	const handleRequestSubmit = (e) => {
		e.preventDefault();
		requestPasswordReset();
	};

	const handleResetSubmit = (e) => {
		e.preventDefault();
		resetPassword();
	};

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			{step === 1 ? (
				<motion.div
					key='step1'
					initial={{ opacity: 0, x: -100 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
					className='sm:mx-auto sm:w-full sm:max-w-md'
				>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-emerald-400'>Forgot Password</h2>
					<p className='mt-2 text-center text-sm text-gray-400'>
						Enter your email to receive a password reset code.
					</p>
					<div className='mt-8 bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10'>
						<form onSubmit={handleRequestSubmit} className='space-y-6'>
							<div>
								<label htmlFor='email' className='block text-sm font-medium text-gray-300'>
									Email address
								</label>
								<div className='mt-1 relative rounded-md shadow-sm'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
										<Mail className='h-5 w-5 text-gray-400' aria-hidden='true' />
									</div>
									<input
										id='email'
										type='email'
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md'
										placeholder='you@example.com'
									/>
								</div>
							</div>
							<button
								type='submit'
								className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700'
								disabled={isRequesting}
							>
								{isRequesting ? <LoadingSpinner size='sm' /> : "Send Reset Code"}
							</button>
						</form>
					</div>
				</motion.div>
			) : (
				<motion.div
					key='step2'
					initial={{ opacity: 0, x: 100 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5 }}
					className='sm:mx-auto sm:w-full sm:max-w-md'
				>
					<h2 className='mt-6 text-center text-3xl font-extrabold text-emerald-400'>Reset Your Password</h2>
					<p className='mt-2 text-center text-sm text-gray-400'>
						A reset code has been sent to {email}.
					</p>
					<div className='mt-8 bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10'>
						<form onSubmit={handleResetSubmit} className='space-y-6'>
							<div>
								<label htmlFor='code' className='block text-sm font-medium text-gray-300'>
									Reset Code
								</label>
								<div className='mt-1 relative rounded-md shadow-sm'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
										<KeyRound className='h-5 w-5 text-gray-400' aria-hidden='true' />
									</div>
									<input
										id='code'
										type='text'
										required
										value={code}
										onChange={(e) => setCode(e.target.value)}
										className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md'
										placeholder='6-digit code'
									/>
								</div>
							</div>
							<div>
								<label htmlFor='password' className='block text-sm font-medium text-gray-300'>
									New Password
								</label>
								<div className='mt-1 relative rounded-md shadow-sm'>
									<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
										<Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
									</div>
									<input
										id='password'
										type='password'
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md'
										placeholder='New password'
									/>
								</div>
							</div>
							<button
								type='submit'
								className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700'
								disabled={isResetting}
							>
								{isResetting ? <LoadingSpinner size='sm' /> : "Reset Password"}
							</button>
						</form>
					</div>
				</motion.div>
			)}
		</div>
	);
};

export default ForgotPasswordPage;