import { useState } from "react";
import OrderDetails from "./OrderDetails"; // This component will be created next

const OrdersTab = ({ orders, openCancelModal, openRefundModal }) => {
	const [selectedOrder, setSelectedOrder] = useState(null);

	if (selectedOrder) {
		return (
			<OrderDetails
				order={selectedOrder}
				onBack={() => setSelectedOrder(null)}
				openCancelModal={openCancelModal}
				openRefundModal={openRefundModal}
			/>
		);
	}

	return (
		<div>
			<h2 className='text-2xl font-bold text-white mb-4'>My Orders</h2>
			{orders?.length === 0 ? (
				<p className='text-center text-gray-400'>You have no orders yet.</p>
			) : (
				<div className='space-y-6'>
					{orders?.map((order) => (
						<div
							key={order._id}
							className='bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition-colors'
							onClick={() => setSelectedOrder(order)}
						>
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
							<div className='border-t border-gray-700 my-4' />
							<div className='flex justify-between items-center'>
								<p className='text-gray-400'>Total Amount</p>
								<p className='font-bold text-white'>₱{order.totalAmount.toFixed(2)}</p>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default OrdersTab;
