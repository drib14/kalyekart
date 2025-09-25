import { useState } from "react";
import { motion } from "framer-motion";

const FloatingFeedbackButton = ({ onClick }) => {
	const [isHovered, setIsHovered] = useState(false);

	const buttonVariants = {
		initial: {
			width: "56px",
		},
		hover: {
			width: "220px",
		},
	};

	const textVariants = {
		initial: {
			opacity: 0,
			x: -10,
			transition: {
				duration: 0.2,
			},
		},
		hover: {
			opacity: 1,
			x: 0,
			transition: {
				delay: 0.2,
				duration: 0.3,
			},
		},
	};

	return (
		<motion.button
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={onClick}
			className='fixed bottom-5 right-5 z-50 bg-emerald-500 text-white rounded-full shadow-lg flex items-center overflow-hidden'
			style={{
				height: "56px",
				padding: "0 1rem",
			}}
			variants={buttonVariants}
			initial='initial'
			animate={isHovered ? "hover" : "initial"}
			transition={{ duration: 0.4, ease: "easeInOut" }}
		>
			<div className='flex items-center justify-start'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					className='h-6 w-6 flex-shrink-0'
					fill='currentColor'
					viewBox='0 0 576 512'
				>
					<path d='m416 192c0-88.4-93.1-160-208-160s-208 71.6-208 160c0 34.3 14.1 65.9 38 92-13.4 30.2-35.5 54.2-35.8 54.5-2.2 2.3-2.8 5.7-1.5 8.7s4.1 4.8 7.3 4.8c36.6 0 66.9-12.3 88.7-25 32.2 15.7 70.3 25 111.3 25 114.9 0 208-71.6 208-160zm122 220c23.9-26 38-57.7 38-92 0-66.9-53.5-124.2-129.3-148.1.9 6.6 1.3 13.3 1.3 20.1 0 105.9-107.7 192-240 192-10.8 0-21.3-.8-31.7-1.9 31.5 57.5 105.5 97.9 191.7 97.9 41 0 79.1-9.2 111.3-25 21.8 12.7 52.1 25 88.7 25 3.2 0 6.1-1.9 7.3-4.8 1.3-2.9.7-6.3-1.5-8.7-.3-.3-22.4-24.2-35.8-54.5z' />
				</svg>
				<motion.span
					className='ml-2 whitespace-nowrap font-medium'
					variants={textVariants}
					initial='initial'
					animate={isHovered ? "hover" : "initial"}
				>
					Submit a feedback
				</motion.span>
			</div>
		</motion.button>
	);
};

export default FloatingFeedbackButton;