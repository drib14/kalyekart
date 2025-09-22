import { categories } from "../data/categories";

const CategoriesTab = () => {
	return (
		<div className='bg-gray-800 shadow-lg rounded-lg p-8'>
			<h2 className='text-2xl font-semibold mb-6 text-emerald-300'>Product Categories</h2>
			<div className='overflow-x-auto'>
				<table className='min-w-full bg-gray-700 rounded-lg'>
					<thead>
						<tr className='bg-gray-600'>
							<th className='text-left py-3 px-4 font-semibold text-gray-300'>Name</th>
							<th className='text-left py-3 px-4 font-semibold text-gray-300'>URL Path (Href)</th>
							<th className='text-left py-3 px-4 font-semibold text-gray-300'>Image URL</th>
						</tr>
					</thead>
					<tbody>
						{categories.map((category) => (
							<tr key={category.name} className='border-b border-gray-600 hover:bg-gray-600/50'>
								<td className='py-3 px-4 text-white'>{category.name}</td>
								<td className='py-3 px-4 text-gray-300 font-mono'>{category.href}</td>
								<td className='py-3 px-4 text-gray-300 font-mono'>{category.imageUrl}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default CategoriesTab;
