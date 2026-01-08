import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { CheckCircle, Clock, Package, ShoppingCart, User, Home, CreditCard, RefreshCw, MessageSquare } from "lucide-react";
import CountdownTimer from "../components/CountdownTimer";
import ProgressBar from "../components/ProgressBar";
import RefundModal from "../components/RefundModal";
import ChatModal from "../components/ChatModal";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { toast } from "sonner";
import useSocket from "../hooks/useSocket";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
	iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
	iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
	shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const driverIcon = new L.Icon({
	iconUrl: "https://cdn-icons-png.flaticon.com/512/171/171250.png",
	iconSize: [32, 32],
	iconAnchor: [16, 32],
	popupAnchor: [0, -32],
});

const OrderDetailPage = () => {
	const { orderId } = useParams();
	const navigate = useNavigate();
	const { addToCart } = useCartStore();
	const { user } = useUserStore();
	const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
	const [isChatOpen, setIsChatOpen] = useState(false);
	const socket = useSocket();
	const [driverLocation, setDriverLocation] = useState(null);

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

	const handleReorder = async () => {
		if (!order) return;

		const availableProducts = order.products.filter((item) => item.product && !item.product.isDeleted);

		if (availableProducts.length === 0) {
			toast.error("There are no available products in this order to reorder.");
			return;
		}

		try {
			const reorderPromises = availableProducts.map((item) => {
				const productWithOptions = {
					...item.product,
					selectedAddons: item.addons,
				};
				return addToCart(productWithOptions, item.quantity);
			});

			await Promise.all(reorderPromises);

			toast.success("All available items have been added to your cart!");
			navigate("/cart");
		} catch (err) {
			toast.error("Something went wrong while trying to reorder. Please try again.");
			console.error("Reorder failed:", err);
		}
	};

	useEffect(() => {
		if (socket && orderId) {
			socket.emit("join_order", orderId);

			socket.on("receive_location", (data) => {
				setDriverLocation(data);
			});

			return () => {
				socket.off("receive_location");
			};
		}
	}, [socket, orderId]);

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
				<header className='flex flex-wrap justify-between items-start mb-8 border-b border-gray-700 pb-6 gap-4'>
					<div>
						<h1 className='text-3xl font-bold text-emerald-400'>Order Details</h1>
						<p className='text-gray-400'>Order ID: {order._id}</p>
						<p className='text-gray-400'>Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
					</div>
					<div className='text-right'>
						<h2 className='text-xl font-semibold'>Total Amount</h2>
						<p className='text-3xl font-bold text-emerald-400'>₱{(order.totalAmount || 0).toFixed(2)}</p>
						<div className='flex items-center justify-end mt-2'>
							{getStatusIcon(order.status)}
							<p className='ml-2 text-lg'>{order.status}</p>
							{order.status !== "Delivered" && order.status !== "Cancelled" && order.statusETA && (
								<div className='ml-4'>
									<CountdownTimer eta={order.statusETA} />
								</div>
							)}
						</div>
						<div className='flex flex-wrap justify-end gap-2 mt-4'>
							{order.status === "Delivered" && user?._id === order.user._id && (
								<button
									className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center'
									onClick={handleReorder}
								>
									<RefreshCw className='mr-2 h-4 w-4' /> Reorder
								</button>
							)}
							<button
								className='px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center'
								onClick={() => setIsChatOpen(true)}
							>
								<MessageSquare className='mr-2 h-4 w-4' /> Chat with Driver
							</button>
							<button
								className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-500'
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
					</div>
				</header>

				<main>
					<section className='mb-8'>
						<h3 className='text-xl font-semibold mb-4 flex items-center'>
							<ShoppingCart className='mr-2' /> Items Ordered
						</h3>
						<div className='space-y-4'>
							{order.products.map((item) => {
								if (!item.product || item.product.isDeleted) {
									return (
										<div
											key={item._id}
											className='flex justify-between items-center bg-gray-700 p-4 rounded-lg'
										>
											<div className='flex items-center gap-4'>
												<div className='w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center'>
													<p className='text-gray-400 text-lg'>?</p>
												</div>
												<div>
													<p className='font-bold text-red-400 italic'>
														Product no longer available
													</p>
												</div>
											</div>
										</div>
									);
								}
								return (
									<div
										key={item._id}
										className='flex justify-between items-center bg-gray-700 p-4 rounded-lg'
									>
										<div className='flex items-center gap-4'>
											<img
												src={item.product.image}
												alt={item.product.name}
												className='w-16 h-16 rounded-lg object-cover'
											/>
											<div>
												<p className='font-bold text-white'>{item.product.name}</p>
												<p className='text-sm text-gray-400'>
													{item.quantity} x ₱{(item.price || 0).toFixed(2)}
												</p>
											</div>
										</div>
										<p className='font-semibold text-white'>
											₱{(item.quantity * (item.price || 0)).toFixed(2)}
										</p>
									</div>
								);
							})}
						</div>
					</section>

					<div className='grid md:grid-cols-3 gap-8'>
						{(order.status === "Out for Delivery" || order.status === "Picked Up") && (
							<section className="md:col-span-3 mb-8">
								<h3 className='text-xl font-semibold mb-4 flex items-center text-emerald-400'>
									<Package className='mr-2' /> Live Driver Tracking
								</h3>
								<div className="h-64 bg-gray-900 rounded-lg overflow-hidden relative">
									{driverLocation ? (
										<MapContainer center={[driverLocation.lat, driverLocation.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
											<TileLayer
												url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
												attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
											/>
											<Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
												<Popup>Driver is here</Popup>
											</Marker>
										</MapContainer>
									) : (
										<div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-800">
											Waiting for driver location...
										</div>
									)}
								</div>
							</section>
						)}

						<section>
							<h3 className='text-xl font-semibold mb-4 flex items-center'>
								<Home className='mr-2' /> Shipping Information
							</h3>
							<div className='bg-gray-700 p-4 rounded-lg space-y-2'>
								<p>
									<strong>Address:</strong> {order.shippingAddress.sitio},{" "}
									{order.shippingAddress.barangay}, {order.shippingAddress.city},{" "}
									{order.shippingAddress.province}, {order.shippingAddress.postalCode}
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
									<strong>Subtotal:</strong> ₱{(order.subtotal || 0).toFixed(2)}
								</p>
								{order.discount && order.discount.code && (
									<p>
										<strong>Discount ({order.discount.code}):</strong> -₱
										{(order.discountAmount || 0).toFixed(2)}
									</p>
								)}
								<p>
									<strong>Delivery Fee:</strong> ₱{(order.deliveryFee || 0).toFixed(2)}
								</p>
								<p className='font-bold text-lg'>
									<strong>Total:</strong> ₱{(order.totalAmount || 0).toFixed(2)}
								</p>
							</div>
						</section>
					</div>
				</main>
			</div>
			{isRefundModalOpen && <RefundModal orderId={order._id} onClose={() => setIsRefundModalOpen(false)} />}
			<ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} orderId={order._id} />
		</div>
	);
};

export default OrderDetailPage;