const CategoryItem = ({ category, onClick, isActive }) => {
	return (
		<button
			onClick={onClick}
			className={`relative overflow-hidden h-48 w-full rounded-lg group focus:outline-none focus:ring-4 focus:ring-emerald-500 ${
				isActive ? "ring-4 ring-emerald-500" : ""
			}`}
		>
			<div className='w-full h-full cursor-pointer'>
				<div className='absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-70 z-10' />
				<img
					src={category.imageUrl}
					alt={category.name}
					className='w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110'
					loading='lazy'
				/>
				<div className='absolute bottom-0 left-0 right-0 p-4 z-20 text-left'>
					<h3 className='text-white text-2xl font-bold'>{category.name}</h3>
				</div>
			</div>
		</button>
	);
};

export default CategoryItem;
