import { useState, useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import { categories } from "../data/categories";

const EditProductModal = ({ isOpen, onClose, product }) => {
	const { updateProduct } = useProductStore();
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		price: "",
		category: "",
		image: "",
	});

	useEffect(() => {
		if (product) {
			setFormData({
				name: product.name,
				description: product.description,
				price: product.price,
				category: product.category,
				image: product.image,
			});
		}
	}, [product]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		updateProduct(product._id, formData);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50'>
			<div className='bg-gray-800 rounded-lg p-8 w-full max-w-md'>
				<h2 className='text-2xl font-bold text-white mb-4'>Edit Product</h2>
				<form onSubmit={handleSubmit}>
					<div className='mb-4'>
						<label htmlFor='name' className='block text-gray-300 mb-2'>
							Name
						</label>
						<input
							type='text'
							name='name'
							id='name'
							value={formData.name}
							onChange={handleChange}
							className='w-full bg-gray-700 text-white rounded-md p-2'
							required
						/>
					</div>
					<div className='mb-4'>
						<label htmlFor='description' className='block text-gray-300 mb-2'>
							Description
						</label>
						<textarea
							name='description'
							id='description'
							value={formData.description}
							onChange={handleChange}
							className='w-full bg-gray-700 text-white rounded-md p-2'
							required
						/>
					</div>
					<div className='mb-4'>
						<label htmlFor='price' className='block text-gray-300 mb-2'>
							Price
						</label>
						<input
							type='number'
							name='price'
							id='price'
							value={formData.price}
							onChange={handleChange}
							className='w-full bg-gray-700 text-white rounded-md p-2'
							required
						/>
					</div>
					<div className='mb-4'>
						<label htmlFor='category' className='block text-gray-300 mb-2'>
							Category
						</label>
						<select
							name='category'
							id='category'
							value={formData.category}
							onChange={handleChange}
							className='w-full bg-gray-700 text-white rounded-md p-2'
							required
						>
							{categories.map((cat) => (
								<option key={cat.id} value={cat.name}>
									{cat.name}
								</option>
							))}
						</select>
					</div>
					<div className='mb-4'>
						<label htmlFor='image' className='block text-gray-300 mb-2'>
							Image URL
						</label>
						<input
							type='text'
							name='image'
							id='image'
							value={formData.image}
							onChange={handleChange}
							className='w-full bg-gray-700 text-white rounded-md p-2'
							required
						/>
					</div>
					<div className='flex justify-end gap-4'>
						<button
							type='button'
							onClick={onClose}
							className='bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded'
						>
							Cancel
						</button>
						<button
							type='submit'
							className='bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded'
						>
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditProductModal;