import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
	const pageNumbers = [];
	for (let i = 1; i <= totalPages; i++) {
		pageNumbers.push(i);
	}

	return (
		<div className='flex justify-center items-center space-x-2 mt-8'>
			<button
				onClick={() => onPageChange(1)}
				disabled={currentPage === 1}
				className='p-2 rounded-lg bg-gray-700 text-white disabled:opacity-50'
			>
				<ChevronsLeft size={20} />
			</button>
			<button
				onClick={() => onPageChange(currentPage - 1)}
				disabled={currentPage === 1}
				className='p-2 rounded-lg bg-gray-700 text-white disabled:opacity-50'
			>
				<ChevronLeft size={20} />
			</button>
			{pageNumbers.map((number) => (
				<button
					key={number}
					onClick={() => onPageChange(number)}
					className={`px-4 py-2 rounded-lg ${
						currentPage === number ? "bg-emerald-600 text-white" : "bg-gray-700 text-white"
					}`}
				>
					{number}
				</button>
			))}
			<button
				onClick={() => onPageChange(currentPage + 1)}
				disabled={currentPage === totalPages}
				className='p-2 rounded-lg bg-gray-700 text-white disabled:opacity-50'
			>
				<ChevronRight size={20} />
			</button>
			<button
				onClick={() => onPageChange(totalPages)}
				disabled={currentPage === totalPages}
				className='p-2 rounded-lg bg-gray-700 text-white disabled:opacity-50'
			>
				<ChevronsRight size={20} />
			</button>
		</div>
	);
};

export default Pagination;
