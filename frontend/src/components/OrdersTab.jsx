import { Link } from "react-router-dom";

const getEffectiveStatus = (order) => {
	if (order.refundRequest) {
		switch (order.refundRequest.status) {
			case "pending":
				return { text: "Refund Requested", color: "bg-blue-500 text-blue-900" };
			case "approved":
				return { text: "Refunded", color: "bg-purple-500 text-purple-900" };
			case "rejected":
				return { text: "Refund Rejected", color: "bg-gray-500 text-gray-900" };
		}
	}
	switch (order.status) {
		case "pending":
			return { text: "Pending", color: "bg-yellow-500 text-yellow-900" };
		case "processing":
			return { text: "Processing", color: "bg-cyan-500 text-cyan-900" };
		case "shipped":
			return { text: "Shipped", color: "bg-indigo-500 text-indigo-900" };
		case "delivered":
			return { text: "Delivered", color: "bg-green-500 text-green-900" };
		case "cancelled":
			return { text: "Cancelled", color: "bg-red-500 text-red-900" };
		default:
			return { text: order.status, color: "bg-gray-500 text-gray-900" };
	}
};

const OrdersTab = ({ orders, openCancelModal, openRefundModal }) => {
	const handleButtonClick = (e, callback) => {
		e.stopPropagation();
		callback();
	};

	return (
		<div>
			<h2 className='text-2xl font-bold text-white mb-4'>My Orders</h2>
			{orders?.length === 0 ? (
				<p className='text-center text-gray-400'>You have no orders yet.</p>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{orders?.map((order) => {
						const effectiveStatus = getEffectiveStatus(order);
						return (
							<Link
								to={`/order/${order._id}`}
								key={order._id}
								className='block bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-colors duration-200 flex flex-col'
							>
								<div className='flex-grow'>
									<div className='flex justify-between items-start mb-4'>
										<div>
											<p className='text-lg font-bold text-white truncate'>
												Order #{order._id.substring(0, 8)}...
											</p>
											<p className='text-sm text-gray-400'>
												{new Date(order.createdAt).toLocaleDateString()}
											</p>
										</div>
										<div
											className={`px-3 py-1 rounded-full text-sm font-medium ${effectiveStatus.color}`}
										>
											{effectiveStatus.text}
										</div>
									</div>
									<div className='space-y-2'>
										{order.products.map((item) => (
											<div
												key={item.product._id}
												className='flex items-center justify-between'
											>
												<p className='font-medium text-white truncate'>
													{item.product.name}
												</p>
												<p className='text-sm text-gray-400'>x{item.quantity}</p>
											</div>
										))}
									</div>
								</div>
								<div className='mt-auto pt-4'>
									<div className='border-t border-gray-700 my-4' />
									<div className='flex justify-between items-center font-bold text-white text-lg'>
										<p>Total</p>
										<p>₱{order.totalAmount.toFixed(2)}</p>
									</div>
									<div className='flex justify-end gap-4 mt-4 flex-wrap'>
										{order.status === "pending" && (
											<button
												onClick={(e) => handleButtonClick(e, () => openCancelModal(order))}
												className='bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm z-10 relative'
											>
												Cancel Order
											</button>
										)}
										{order.status === "delivered" && !order.refundRequest && (
											<button
												onClick={(e) => handleButtonClick(e, () => openRefundModal(order))}
												className='bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm z-10 relative'
											>
												Request Refund
											</button>
										)}
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default OrdersTab;
