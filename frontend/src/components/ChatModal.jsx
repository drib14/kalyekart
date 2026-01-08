import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import OrderChat from "./OrderChat";

const ChatModal = ({ isOpen, onClose, orderId }) => {
	if (!isOpen) return null;

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm px-4'
				>
					<motion.div
						initial={{ scale: 0.9, opacity: 0, y: 20 }}
						animate={{ scale: 1, opacity: 1, y: 0 }}
						exit={{ scale: 0.9, opacity: 0, y: 20 }}
						className='bg-gray-800 rounded-lg shadow-xl w-full max-w-lg overflow-hidden border border-gray-700'
					>
						<div className='flex justify-end p-2'>
							<button onClick={onClose} className='text-gray-400 hover:text-white'>
								<X size={24} />
							</button>
						</div>
                        <div className="p-1 h-full">
						    <OrderChat orderId={orderId} />
                        </div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default ChatModal;
