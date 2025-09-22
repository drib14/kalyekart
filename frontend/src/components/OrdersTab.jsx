const OrdersTab = ({ orders, openCancelModal, openRefundModal }) => {

	return (
		<div>
			<h2 className='text-2xl font-bold text-white mb-4'>My Orders</h2>
			{orders?.length === 0 ? (
				<p className='text-center text-gray-400'>You have no orders yet.</p>
			) : (
				<div className='space-y-6'>
					{orders?.map((order) => (
						<div key={order._id} className='bg-gray-800 p-6 rounded-lg shadow-lg'>
							<div className='flex justify-between items-start'>
								<div>
									<p className='text-lg font-bold text-white'>Order ID: {order._id}</p>
									<p className='text-sm text-gray-400'>
										Placed on: {new Date(order.createdAt).toLocaleDateString()}
									</p>
								</div>
								<div
									className={`px-3 py-1 rounded-full text-sm font-medium ${
										order.status === "pending"
											? "bg-yellow-500 text-yellow-900"
											: order.status === "delivered"
											? "bg-green-500 text-green-900"
											: "bg-red-500 text-red-900"
									}`}
								>
									{order.status}
								</div>
							</div>
							<div className='mt-4'>
								{order.products.map((item) => (
									<div
										key={item.product._id}
										className='flex items-center justify-between py-2'
									>
										<div>
											<p className='font-medium text-white'>{item.product.name}</p>
											<p className='text-sm text-gray-400'>
												{item.quantity} x ₱{item.price.toFixed(2)}
											</p>
										</div>
										<p className='font-medium text-white'>
											₱{(item.quantity * item.price).toFixed(2)}
										</p>
									</div>
								))}
							</div>
							<div className='border-t border-gray-700 my-4' />
							<div className='flex justify-between items-center font-bold text-white'>
								<p>Total</p>
								<p>₱{order.totalAmount.toFixed(2)}</p>
							</div>
							<div className='flex justify-end gap-4 mt-4'>
								{order.status === "pending" && (
									<button
										onClick={() => openCancelModal(order)}
										className='bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md'
									>
										Cancel Order
									</button>
								)}
								{order.status === "delivered" && (
									<button
										onClick={() => openRefundModal(order)}
										className='bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md'
									>
										Request Refund
									</button>
								)}
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default OrdersTab;
