import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const SettingsModal = ({ isOpen, onClose, title, children, onSave, isSaving }) => {
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
						<div className='flex justify-between items-center p-6 border-b border-gray-700'>
							<h2 className='text-xl font-bold text-emerald-400'>{title}</h2>
							<button onClick={onClose} className='text-gray-400 hover:text-white transition-colors'>
								<X size={24} />
							</button>
						</div>
						<div className='p-6 max-h-[70vh] overflow-y-auto'>{children}</div>
						<div className='p-6 border-t border-gray-700 flex justify-end gap-4'>
							<button
								onClick={onClose}
								className='px-4 py-2 text-gray-400 hover:text-white transition-colors'
								disabled={isSaving}
							>
								Cancel
							</button>
							<button
								onClick={onSave}
								disabled={isSaving}
								className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center'
							>
								{isSaving ? (
									<>
										<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
										Saving...
									</>
								) : (
									"Save Changes"
								)}
							</button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default SettingsModal;
