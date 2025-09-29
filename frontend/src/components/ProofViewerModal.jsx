import { X } from "lucide-react";

const ProofViewerModal = ({ proofUrl, onClose }) => {
	const isVideo = proofUrl.match(/\.(mp4|webm|ogg)$/i);

	return (
		<div className='fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4'>
			<div className='bg-gray-900 p-2 sm:p-4 rounded-lg shadow-xl max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl w-full relative'>
				<button
					onClick={onClose}
					className='absolute top-2 right-2 sm:-top-2 sm:-right-2 bg-gray-700 rounded-full p-1 text-white hover:bg-red-600 z-10'
				>
					<X size={20} />
				</button>

				<div className='max-h-[85vh]'>
					{isVideo ? (
						<video src={proofUrl} controls autoPlay className='w-full h-full object-contain rounded-lg'>
							Your browser does not support the video tag.
						</video>
					) : (
						<img src={proofUrl} alt='Refund Proof' className='w-full h-full object-contain rounded-lg' />
					)}
				</div>
			</div>
		</div>
	);
};

export default ProofViewerModal;
