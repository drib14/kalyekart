import { X, Star } from "lucide-react";
import { Link } from "react-router-dom";

const ReviewPromptModal = ({ isOpen, onClose, order }) => {
	if (!isOpen || !order) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50'>
			<div className='bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4'>
				<div className='p-6 border-b border-gray-700 flex justify-between items-center'>
					<h2 className='text-2xl font-bold text-emerald-400'>How was your order?</h2>
					<button onClick={onClose} className='text-gray-400 hover:text-white'>
						<X size={24} />
					</button>
				</div>
				<div className='p-6'>
					<p className='text-gray-300 mb-6'>
						Your feedback is valuable. Please take a moment to review the items you purchased.
					</p>
					<div className='space-y-4 max-h-80 overflow-y-auto pr-2'>
						{order.products.map(({ product, quantity }) => (
							<div
								key={product._id}
								className='flex items-center justify-between bg-gray-700 p-4 rounded-lg'
							>
								<div className='flex items-center'>
									<img
										src={product.image}
										alt={product.name}
										className='w-16 h-16 rounded-md object-cover mr-4'
									/>
									<div>
										<h3 className='font-semibold text-white'>{product.name}</h3>
										<p className='text-sm text-gray-400'>Quantity: {quantity}</p>
									</div>
								</div>
								<Link
									to={`/product/${product._id}?review=true`}
									onClick={onClose}
									className='bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center'
								>
									<Star size={16} className='mr-2' />
									Rate Item
								</Link>
							</div>
						))}
					</div>
				</div>
				<div className='p-6 bg-gray-900/50 rounded-b-lg text-center'>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-white transition-colors duration-300'
					>
						Maybe Later
					</button>
				</div>
			</div>
		</div>
	);
};

export default ReviewPromptModal;