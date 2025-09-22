import { X } from "lucide-react";

const ProofViewerModal = ({ proofUrl, onClose }) => {
	const isVideo = proofUrl.match(/\.(mp4|webm|ogg)$/i);

	return (
		<div className='fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4'>
			<div className='bg-gray-900 p-4 rounded-lg shadow-xl max-w-4xl w-full relative'>
				<button
					onClick={onClose}
					className='absolute -top-4 -right-4 bg-gray-700 rounded-full p-1 text-white hover:bg-red-600'
				>
					<X size={24} />
				</button>

				<div className='max-h-[80vh]'>
					{isVideo ? (
						<video src={proofUrl} controls autoPlay className='w-full h-full object-contain'>
							Your browser does not support the video tag.
						</video>
					) : (
						<img src={proofUrl} alt='Refund Proof' className='w-full h-full object-contain' />
					)}
				</div>
			</div>
		</div>
	);
};

export default ProofViewerModal;
