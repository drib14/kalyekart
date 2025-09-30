import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFoundPage = () => {
	return (
		<div className='min-h-screen flex flex-col items-center justify-center text-center px-4'>
			<motion.div
				initial={{ opacity: 0, scale: 0.5 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{
					duration: 0.8,
					delay: 0.2,
					ease: [0, 0.71, 0.2, 1.01],
				}}
			>
				<img src='/logo.jpg' alt='KalyeKart Logo' className='w-24 h-24 rounded-full mx-auto mb-6' />
				<h1 className='text-6xl font-extrabold text-emerald-400'>404</h1>
				<p className='text-2xl font-semibold text-white mt-4'>Page Not Found</p>
				<p className='text-gray-400 mt-2'>
					Sorry, the page you are looking for does not exist or has been moved.
				</p>
				<Link
					to='/'
					className='mt-8 inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300'
				>
					Return Home
				</Link>
			</motion.div>
		</div>
	);
};

export default NotFoundPage;