const CategoryTab = ({ category, onClick, isActive }) => {
	return (
		<button
			onClick={onClick}
			className={`flex-shrink-0 flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-t-lg border-b-2 transition-all duration-300 ease-in-out ${
				isActive
					? "bg-gray-800 border-emerald-400"
					: "bg-gray-900 border-transparent hover:bg-gray-800/50"
			}`}
		>
			<img
				src={category.imageUrl}
				alt={category.name}
				className='w-4 h-4 sm:w-5 sm:h-5 object-cover rounded-full'
			/>
			<span className={`text-xs sm:text-sm font-medium ${isActive ? "text-emerald-400" : "text-gray-300"}`}>
				{category.name}
			</span>
		</button>
	);
};

export default CategoryTab;
