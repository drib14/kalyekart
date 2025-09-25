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
						fill='currentColor'
						viewBox='0 0 576 512'
					>
						<path d='m416 192c0-88.4-93.1-160-208-160s-208 71.6-208 160c0 34.3 14.1 65.9 38 92-13.4 30.2-35.5 54.2-35.8 54.5-2.2 2.3-2.8 5.7-1.5 8.7s4.1 4.8 7.3 4.8c36.6 0 66.9-12.3 88.7-25 32.2 15.7 70.3 25 111.3 25 114.9 0 208-71.6 208-160zm122 220c23.9-26 38-57.7 38-92 0-66.9-53.5-124.2-129.3-148.1.9 6.6 1.3 13.3 1.3 20.1 0 105.9-107.7 192-240 192-10.8 0-21.3-.8-31.7-1.9 31.5 57.5 105.5 97.9 191.7 97.9 41 0 79.1-9.2 111.3-25 21.8 12.7 52.1 25 88.7 25 3.2 0 6.1-1.9 7.3-4.8 1.3-2.9.7-6.3-1.5-8.7-.3-.3-22.4-24.2-35.8-54.5z' />
					</svg>
				</button>
			</div>
		</div>
	);
};

export default FloatingFeedbackButton;