import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const FloatingFeedbackButton = ({ onClick }) => {
	const [isHovered, setIsHovered] = useState(false);
	const [showText, setShowText] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			setShowText(true);
			setTimeout(() => setShowText(false), 5000); // Show text for 5 seconds
		}, 300000); // Animate every 5 minutes

		return () => clearInterval(interval);
	}, []);

	return (
		<div
			className='fixed bottom-5 right-5 z-50'
			onMouseEnter={() => {
				setIsHovered(true);
				setShowText(true);
			}}
			onMouseLeave={() => {
				setIsHovered(false);
				setShowText(false);
			}}
		>
			<div className='relative flex items-center'>
				<AnimatePresence>
					{showText && (
						<motion.div
							initial={{ width: 0, opacity: 0 }}
							animate={{ width: "auto", opacity: 1 }}
							exit={{ width: 0, opacity: 0 }}
							transition={{ duration: 0.5 }}
							className='absolute right-14 whitespace-nowrap bg-gray-800 text-white p-2 rounded-md'
						>
							How's the app?
						</motion.div>
					)}
				</AnimatePresence>
				<button className='bg-emerald-500 text-white rounded-full p-4 shadow-lg' onClick={onClick}>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-6 w-6'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M8 10h.01M12 10h.01M16 10h.01M9 16h6m2 5a9 9 0 11-18 0 9 9 0 0118 0z'
						/>
					</svg>
				</button>
			</div>
		</div>
	);
};

export default FloatingFeedbackButton;