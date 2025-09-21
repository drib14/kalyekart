import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { motion } from "framer-motion";
import { Phone, ArrowRight } from "lucide-react";

const ForgotPasswordPage = () => {
	const [phoneNumber, setPhoneNumber] = useState("");

	const { mutate: forgotPassword, isPending } = useMutation({
		mutationFn: (phoneNumber) => {
			return axios.post("/auth/forgot-password", { phoneNumber });
		},
		onSuccess: () => {
			toast.success("Password reset code sent to your phone");
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		forgotPassword(phoneNumber);
	};

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<motion.div
				className='sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-emerald-400'>Forgot Password</h2>
				<p className='mt-2 text-center text-sm text-gray-400'>
					Enter your phone number and we'll send you a reset code.
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
							<label htmlFor='phoneNumber' className='block text-sm font-medium text-gray-300'>
								Phone number
							</label>
							<div className='mt-1 relative rounded-md shadow-sm'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Phone className='h-5 w-5 text-gray-400' aria-hidden='true' />
								</div>
								<input
									id='phoneNumber'
									type='text'
									required
									value={phoneNumber}
									onChange={(e) => setPhoneNumber(e.target.value)}
									className=' block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600
									rounded-md shadow-sm
									 placeholder-gray-400 focus:outline-none focus:ring-emerald-500
									 focus:border-emerald-500 sm:text-sm'
									placeholder='09123456789'
								/>
							</div>
						</div>

						<button
							type='submit'
							className='w-full flex justify-center py-2 px-4 border border-transparent
							rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600
							 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50'
							disabled={isPending}
						>
							{isPending ? <LoadingSpinner /> : "Send Code"}
						</button>
					</form>

					<p className='mt-8 text-center text-sm text-gray-400'>
						Remember your password?{" "}
						<Link to='/login' className='font-medium text-emerald-400 hover:text-emerald-300'>
							Login now <ArrowRight className='inline h-4 w-4' />
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};

export default ForgotPasswordPage;
