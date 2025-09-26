import { AlertTriangle, X } from "lucide-react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4'>
			<div className='bg-gray-800 rounded-lg shadow-xl max-w-sm w-full'>
				<div className='p-6'>
					<div className='flex items-start'>
						<div className='mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10'>
							<AlertTriangle className='h-6 w-6 text-red-400' aria-hidden='true' />
						</div>
						<div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
							<h3 className='text-lg leading-6 font-medium text-white' id='modal-title'>
								{title}
							</h3>
							<div className='mt-2'>
								<p className='text-sm text-gray-400'>{message}</p>
							</div>
						</div>
					</div>
				</div>
				<div className='bg-gray-800/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
					<button
						type='button'
						className='w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm'
						onClick={onConfirm}
					>
						Confirm
					</button>
					<button
						type='button'
						className='mt-3 w-full inline-flex justify-center rounded-lg border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:w-auto sm:text-sm'
						onClick={onClose}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmationModal;
