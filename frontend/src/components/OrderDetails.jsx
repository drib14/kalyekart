import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import VirtualReceipt from "./VirtualReceipt";

const OrderDetails = ({ order, onBack, openCancelModal, openRefundModal }) => {
	const [activeTab, setActiveTab] = useState("details");

	return (
		<div>
			<button onClick={onBack} className='flex items-center text-emerald-400 hover:text-emerald-300 mb-4'>
				<ArrowLeft className='mr-2' size={20} />
				Back to All Orders
			</button>

			<div className='flex border-b border-gray-700 mb-4'>
				<button
					onClick={() => setActiveTab("details")}
					className={`py-2 px-4 text-sm font-medium ${
						activeTab === "details"
							? "border-b-2 border-emerald-500 text-emerald-400"
							: "text-gray-400 hover:text-white"
					}`}
				>
					Order Details
				</button>
				{order.status === "delivered" && (
					<button
						onClick={() => setActiveTab("receipt")}
						className={`py-2 px-4 text-sm font-medium ${
							activeTab === "receipt"
								? "border-b-2 border-emerald-500 text-emerald-400"
								: "text-gray-400 hover:text-white"
						}`}
					>
						Virtual Receipt
					</button>
				)}
			</div>

			{activeTab === "details" && (
				<div className='bg-gray-800 p-6 rounded-lg shadow-lg'>
					<div className='flex justify-between items-start mb-4'>
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

					<h3 className='text-xl font-bold text-white mb-2'>Items</h3>
					<div className='mt-4 space-y-2'>
						{order.products.map((item) => (
							<div key={item.product._id} className='flex items-center justify-between py-2'>
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

					<div className='flex justify-between items-center font-bold text-white text-lg'>
						<p>Total</p>
						<p>₱{order.totalAmount.toFixed(2)}</p>
					</div>

					<div className='border-t border-gray-700 my-4' />

					<h3 className='text-xl font-bold text-white mb-2'>Shipping Information</h3>
					<div className='text-gray-300'>
						<p>{order.shippingAddress.fullName}</p>
						<p>{order.shippingAddress.streetAddress}</p>
						<p>
							{order.shippingAddress.city}, {order.shippingAddress.province}{" "}
							{order.shippingAddress.postalCode}
						</p>
						<p>Contact: {order.contactNumber}</p>
					</div>

					<div className='flex justify-end gap-4 mt-6'>
						{order.status === "pending" && (
							<button
								onClick={() => openCancelModal(order)}
								className='bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md'
							>
								Cancel Order
							</button>
						)}
						{order.status === "delivered" && !order.refundRequest && (
							<button
								onClick={() => openRefundModal(order)}
								className='bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md'
							>
								Request Refund
							</button>
						)}
					</div>
					{order.refundRequest && (
						<div className='mt-4 border-t border-gray-700 pt-4'>
							<h3 className='text-xl font-bold text-white mb-2'>Refund Status</h3>
							<p className='text-lg text-gray-300'>
								Status: <span className='font-semibold text-emerald-400'>{order.refundRequest.status}</span>
							</p>
						</div>
					)}
				</div>
			)}
			{activeTab === "receipt" && <VirtualReceipt order={order} />}
		</div>
	);
};

export default OrderDetails;
