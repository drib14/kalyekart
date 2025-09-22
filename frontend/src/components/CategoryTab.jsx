const CategoryTab = ({ category, onClick, isActive }) => {
	return (
		<button
			onClick={onClick}
			className={`flex flex-col items-center justify-center gap-2 p-2 rounded-lg transition-colors duration-300 flex-shrink-0 ${
				isActive ? "bg-emerald-500/20" : "hover:bg-gray-700/50"
			}`}
		>
			<div className='w-16 h-16 rounded-full overflow-hidden border-2 border-transparent group-hover:border-emerald-400'>
				<img
					src={category.imageUrl}
					alt={category.name}
					className={`w-full h-full object-cover transition-transform duration-300 ${
						isActive ? "scale-110" : ""
					}`}
				/>
			</div>
			<span className={`text-sm font-semibold ${isActive ? "text-emerald-400" : "text-gray-300"}`}>
				{category.name}
			</span>
		</button>
	);
};

export default CategoryTab;
