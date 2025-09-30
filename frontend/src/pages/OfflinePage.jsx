import { WifiOff } from "lucide-react";
import { motion } from "framer-motion";

const OfflinePage = () => {
	return (
		<div className='min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gray-900 text-white'>
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='flex flex-col items-center'
			>
				<WifiOff className='w-24 h-24 text-red-500 mb-6' />
				<h1 className='text-4xl font-extrabold text-white'>You are currently offline</h1>
				<p className='text-lg text-gray-400 mt-4'>
					Please check your internet connection and try again.
				</p>
			</motion.div>
		</div>
	);
};

export default OfflinePage;