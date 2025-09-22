const VirtualReceipt = ({ order }) => {
	return (
		<div className='bg-white text-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-auto font-mono'>
			<div className='text-center mb-8'>
				<h2 className='text-2xl font-bold'>INVOICE</h2>
				<p className='text-sm text-gray-500'>Thank you for your purchase!</p>
			</div>

			<div className='flex justify-between mb-4 text-sm'>
				<div>
					<p className='font-bold'>Order ID:</p>
					<p>{order._id}</p>
				</div>
				<div>
					<p className='font-bold'>Date:</p>
					<p>{new Date(order.createdAt).toLocaleDateString()}</p>
				</div>
			</div>

			<div className='mb-8'>
				<h3 className='font-bold border-b-2 border-gray-300 pb-1 mb-2'>Bill To:</h3>
				<p>{order.shippingAddress.fullName}</p>
				<p>{order.shippingAddress.streetAddress}</p>
				<p>
					{order.shippingAddress.city}, {order.shippingAddress.province}{" "}
					{order.shippingAddress.postalCode}
				</p>
			</div>

			<table className='w-full text-sm mb-8'>
				<thead>
					<tr className='border-b-2 border-gray-300'>
						<th className='text-left pb-1'>Item</th>
						<th className='text-center pb-1'>Qty</th>
						<th className='text-right pb-1'>Price</th>
						<th className='text-right pb-1'>Total</th>
					</tr>
				</thead>
				<tbody>
					{order.products.map((item) => (
						<tr key={item.product._id}>
							<td className='py-2'>{item.product.name}</td>
							<td className='text-center py-2'>{item.quantity}</td>
							<td className='text-right py-2'>₱{item.price.toFixed(2)}</td>
							<td className='text-right py-2'>₱{(item.quantity * item.price).toFixed(2)}</td>
						</tr>
					))}
				</tbody>
			</table>

			<div className='flex justify-end'>
				<div className='w-1/2'>
					<div className='flex justify-between mb-2'>
						<p className='text-gray-600'>Subtotal:</p>
						<p>₱{order.totalAmount.toFixed(2)}</p>
					</div>
					<div className='flex justify-between font-bold text-lg border-t-2 border-gray-300 pt-2'>
						<p>TOTAL:</p>
						<p>₱{order.totalAmount.toFixed(2)}</p>
					</div>
				</div>
			</div>

			<div className='text-center mt-12 text-xs text-gray-500'>
				<p>Thank you for shopping with us!</p>
				<p>If you have any questions, please contact support.</p>
			</div>
		</div>
	);
};

export default VirtualReceipt;
