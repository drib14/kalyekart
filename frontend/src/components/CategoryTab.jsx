const CategoryTab = ({ category, onClick, isActive }) => {
	return (
		<button
			onClick={onClick}
			className={`relative group flex flex-col items-center justify-center gap-2 p-2 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 ${
				isActive ? "bg-emerald-600/30 shadow-lg" : "bg-gray-800/50 hover:bg-gray-700/80"
			}`}
		>
			<div className='w-20 h-20 rounded-full overflow-hidden border-2 border-transparent group-hover:border-emerald-400 transition-all duration-300'>
				<img
					src={category.imageUrl}
					alt={category.name}
					className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${
						isActive ? "scale-110" : ""
					}`}
				/>
			</div>
			<span
				className={`text-base font-semibold transition-colors duration-300 ${
					isActive ? "text-emerald-300" : "text-gray-200 group-hover:text-white"
				}`}
			>
				{category.name}
			</span>
			{isActive && (
				<div className='absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full shadow-md animate-pulse'></div>
			)}
		</button>
	);
};

export default CategoryTab;
