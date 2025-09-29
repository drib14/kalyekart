import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquarePlus } from "lucide-react";

const FloatingFeedbackButton = ({ onClick }) => {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<motion.div
			className='fixed bottom-5 right-5 z-50 flex items-center'
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}
			initial={{ scale: 0, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1.5 }}
		>
			<AnimatePresence>
				{isHovered && (
					<motion.div
						initial={{ width: 0, opacity: 0, x: 20 }}
						animate={{ width: "auto", opacity: 1, x: 0 }}
						exit={{ width: 0, opacity: 0, x: 20 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
						className='absolute right-16 whitespace-nowrap bg-gray-800 text-white p-2 rounded-lg shadow-md'
					>
						Got feedback?
					</motion.div>
				)}
			</AnimatePresence>
			<motion.button
				className='bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center'
				onClick={onClick}
				whileHover={{ scale: 1.15, rotate: 15 }}
				transition={{ type: "spring", stiffness: 300, damping: 10 }}
			>
				<MessageSquarePlus size={24} />
			</motion.button>
		</motion.div>
	);
};

export default FloatingFeedbackButton;