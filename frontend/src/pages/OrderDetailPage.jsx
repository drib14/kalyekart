import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { CheckCircle, Clock, Package, ShoppingCart, User, Home, Phone, CreditCard } from "lucide-react";
import CountdownTimer from "../components/CountdownTimer";
import ProgressBar from "../components/ProgressBar";
import RefundModal from "../components/RefundModal";

const OrderDetailPage = () => {
	const { orderId } = useParams();
	const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);

	const {
		data: order,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["order", orderId],
		queryFn: async () => {
			const res = await axios.get(`/orders/${orderId}`);
			return res.data;
		},
	});

	if (isLoading) return <LoadingSpinner />;
	if (isError) return <div className='text-center py-10 text-red-500'>Error: {error.response.data.message}</div>;

	const getStatusIcon = (status) => {
		switch (status) {
			case "Preparing":
				return <Clock className='w-5 h-5' />;
			case "Out for Delivery":
				return <Package className='w-5 h-5' />;
			case "Delivered":
				return <CheckCircle className='w-5 h-5' />;
			default:
				return <Clock className='w-5 h-5' />;
		}
	};

	return (
		<div className='min-h-screen bg-gray-900 text-white p-4 sm:p-8'>
			<div className='max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-2xl p-6 sm:p-8'>
				<header className='flex justify-between items-start mb-8 border-b border-gray-700 pb-6'>
					<div>
						<h1 className='text-3xl font-bold text-emerald-400'>Order Details</h1>
						<p className='text-gray-400'>Order ID: {order._id}</p>
						<p className='text-gray-400'>Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
					</div>
					<div className='text-right'>
						<h2 className='text-xl font-semibold'>Total Amount</h2>
						<p className='text-3xl font-bold text-emerald-400'>₱{order.totalAmount.toFixed(2)}</p>
						<div className='flex items-center justify-end mt-2'>
							{getStatusIcon(order.status)}
							<p className='ml-2 text-lg'>{order.status}</p>
							{order.status !== "Delivered" && order.status !== "Cancelled" && order.statusETA && (
								<div className='ml-4'>
									<CountdownTimer eta={order.statusETA} />
								</div>
							)}
						</div>
						<button
							className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500'
							disabled={order.status !== "Delivered" || order.refundRequest}
							onClick={() => setIsRefundModalOpen(true)}
							title={
								order.status !== "Delivered"
									? "You can only request a refund for delivered orders."
									: order.refundRequest
									? "You have already requested a refund for this order."
									: "Request a refund for this order"
							}
						>
							Request Refund
						</button>
					</div>
				</header>

				<section className='mb-8'>
					<h3 className='text-xl font-semibold mb-4'>Order Progress</h3>
					<ProgressBar status={order.status} />
				</section>

				<main>
					<section className='mb-8'>
						<h3 className='text-xl font-semibold mb-4 flex items-center'><ShoppingCart className='mr-2' /> Items Ordered</h3>
						<div className='space-y-4'>
							{order.products.map((item) => {
								if (!item.product || item.product.isDeleted) {
									return (
										<div key={item._id} className='flex justify-between items-center bg-gray-700 p-4 rounded-lg'>
											<div className='flex items-center gap-4'>
												<div className='w-16 h-16 bg-gray-600 rounded-md flex items-center justify-center'>
													<p className='text-gray-400 text-lg'>?</p>
												</div>
												<div>
													<p className='font-bold text-red-400 italic'>Product no longer available</p>
												</div>
											</div>
										</div>
									);
								}
								return (
									<div key={item._id} className='flex justify-between items-center bg-gray-700 p-4 rounded-lg'>
										<div className='flex items-center gap-4'>
											<img src={item.product.image} alt={item.product.name} className='w-16 h-16 rounded-md object-cover'/>
											<div>
												<p className='font-bold text-white'>{item.product.name}</p>
												<p className='text-sm text-gray-400'>
													{item.quantity} x ₱{item.price.toFixed(2)}
												</p>
											</div>
										</div>
										<p className='font-semibold text-white'>₱{(item.quantity * item.price).toFixed(2)}</p>
									</div>
								)
							})}
						</div>
					</section>

					<div className='grid md:grid-cols-3 gap-8'>
						<section>
							<h3 className='text-xl font-semibold mb-4 flex items-center'>
								<Home className='mr-2' /> Shipping Information
							</h3>
							<div className='bg-gray-700 p-4 rounded-lg space-y-2'>
								<p>
									<strong>Address:</strong> {order.shippingAddress.streetAddress},{" "}
									{order.shippingAddress.city}, {order.shippingAddress.province},{" "}
									{order.shippingAddress.postalCode}
								</p>
								<p>
									<strong>Contact:</strong> {order.contactNumber}
								</p>
							</div>
						</section>
						<section>
							<h3 className='text-xl font-semibold mb-4 flex items-center'>
								<User className='mr-2' /> Customer Information
							</h3>
							<div className='bg-gray-700 p-4 rounded-lg space-y-2'>
								<p>
									<strong>Name:</strong> {order.user.name}
								</p>
								<p>
									<strong>Email:</strong> {order.user.email}
								</p>
							</div>
						</section>
						<section>
							<h3 className='text-xl font-semibold mb-4 flex items-center'>
								<CreditCard className='mr-2' /> Payment Information
							</h3>
							<div className='bg-gray-700 p-4 rounded-lg space-y-2'>
								<p>
									<strong>Method:</strong> {order.paymentMethod.toUpperCase()}
								</p>
								<p>
									<strong>Status:</strong> <span className='capitalize'>{order.paymentStatus}</span>
								</p>
								<div className='border-t border-gray-600 my-2' />
								<p>
									<strong>Subtotal:</strong> ₱{order.subtotal.toFixed(2)}
								</p>
								{order.coupon && (
									<p>
										<strong>Discount:</strong> -{order.coupon.discountPercentage}%
									</p>
								)}
								<p>
									<strong>Delivery Fee:</strong> ₱{order.deliveryFee.toFixed(2)}
								</p>
								<p className='font-bold text-lg'>
									<strong>Total:</strong> ₱{order.totalAmount.toFixed(2)}
								</p>
							</div>
						</section>
					</div>
				</main>
			</div>
			{isRefundModalOpen && (
				<RefundModal
					orderId={order._id}
					onClose={() => setIsRefundModalOpen(false)}
				/>
			)}
		</div>
	);
};

export default OrderDetailPage;
