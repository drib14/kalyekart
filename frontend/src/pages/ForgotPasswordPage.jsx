import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const navigate = useNavigate();

	const { mutate: requestPasswordReset, isPending: isRequesting } = useMutation({
		mutationFn: () => {
			return axios.post("/auth/forgot-password", { email });
		},
		onSuccess: (data) => {
			toast.success(data.data.message);
			navigate("/reset-password", { state: { email } });
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Failed to request password reset.");
		},
	});

	const handleRequestSubmit = (e) => {
		e.preventDefault();
		requestPasswordReset();
	};

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
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
									className='block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-lg'
									placeholder='you@example.com'
								/>
							</div>
						</div>
						<button
							type='submit'
							className='w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700'
							disabled={isRequesting}
						>
							{isRequesting ? <LoadingSpinner size='sm' /> : "Send Reset Code"}
						</button>
					</form>
				</div>
			</motion.div>
		</div>
	);
};

export default ForgotPasswordPage;