import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, Loader } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { toast } from "sonner";

const GoogleIcon = () => (
	<svg className='h-5 w-5 mr-2' viewBox='0 0 24 24'>
		<path
			d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
			fill='#4285F4'
		/>
		<path
			d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.3v2.84C4.02 20.44 7.7 23 12 23z'
			fill='#34A853'
		/>
		<path
			d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.3C1.42 8.84 1 10.36 1 12s.42 3.16 1.2 4.93l3.54-2.84z'
			fill='#FBBC05'
		/>
		<path
			d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4.02 3.56 2.3 6.93l3.54 2.84c.87-2.6 3.3-4.4 6.16-4.4z'
			fill='#EA4335'
		/>
		<path d='M1 1h22v22H1z' fill='none' />
	</svg>
);

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const { login, loading, googleLogin } = useUserStore();

	const handleSubmit = (e) => {
		e.preventDefault();
		login(email, password);
	};

	const handleGoogleLogin = useGoogleLogin({
		onSuccess: async (tokenResponse) => {
			try {
				const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
					headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
				});
				await googleLogin(res.data);
			} catch (error) {
				console.log(error);
				toast.error("Google login failed. Please try again.");
			}
		},
		onError: () => {
			console.log("Login Failed");
			toast.error("Google login failed. Please try again.");
		},
	});

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8'>
			<motion.div
				className='sm:mx-auto sm:w-full sm:max-w-md'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<h2 className='mt-6 text-center text-3xl font-extrabold text-emerald-400'>
					Sign in to your account
				</h2>
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
							<label htmlFor='email' className='block text-sm font-medium text-gray-300'>
								Email address
							</label>
							<div className='mt-1 relative rounded-lg shadow-sm'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Mail className='h-5 w-5 text-gray-400' aria-hidden='true' />
								</div>
								<input
									id='email'
									type='email'
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className=' block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
									rounded-lg shadow-sm
									 placeholder-gray-400 focus:outline-none focus:ring-emerald-500 
									 focus:border-emerald-500 sm:text-sm'
									placeholder='you@example.com'
								/>
							</div>
						</div>

						<div>
							<label htmlFor='password' className='block text-sm font-medium text-gray-300'>
								Password
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
									className=' block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 
									rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
									placeholder='••••••••'
								/>
							</div>
						</div>

						<button
							type='submit'
							className='w-full flex justify-center py-2 px-4 border border-transparent 
							rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600
							 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50'
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
									Loading...
								</>
							) : (
								<>
									<LogIn className='mr-2 h-5 w-5' aria-hidden='true' />
									Login
								</>
							)}
						</button>
					</form>

					<div className='mt-6'>
						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-gray-700' />
							</div>
							<div className='relative flex justify-center text-sm'>
								<span className='px-2 bg-gray-800 text-gray-400'>Or continue with</span>
							</div>
						</div>

						<div className='mt-6'>
							<button
								onClick={() => handleGoogleLogin()}
								className='w-full flex justify-center items-center py-2 px-4 border border-gray-600
                rounded-lg shadow-sm text-sm font-medium text-white bg-gray-700
                hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2
                focus:ring-emerald-500 transition duration-150 ease-in-out'
							>
								<GoogleIcon />
								Sign in with Google
							</button>
						</div>
					</div>

					<div className='flex items-center justify-between mt-6'>
						<div className='text-sm'>
							<Link
								to='/forgot-password'
								className='font-medium text-emerald-400 hover:text-emerald-300'
							>
								Forgot your password?
							</Link>
						</div>
					</div>
					<p className='mt-8 text-center text-sm text-gray-400'>
						Not a member?{" "}
						<Link to='/signup' className='font-medium text-emerald-400 hover:text-emerald-300'>
							Sign up now <ArrowRight className='inline h-4 w-4' />
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
};
export default LoginPage;
