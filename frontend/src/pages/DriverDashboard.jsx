import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { MapPin, Check, Navigation, Package } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
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
	iconUrl: "https://cdn-icons-png.flaticon.com/512/171/171250.png", // Motorcycle/Driver icon
	iconSize: [32, 32],
	iconAnchor: [16, 32],
	popupAnchor: [0, -32],
});

const DriverDashboard = () => {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("available");
	const socket = useSocket();
	const [location, setLocation] = useState(null);
	const watchIdRef = useRef(null);

	// Get Location on Mount
	useEffect(() => {
		if ("geolocation" in navigator) {
			watchIdRef.current = navigator.geolocation.watchPosition(
				(position) => {
					const { latitude, longitude } = position.coords;
					setLocation({ lat: latitude, lng: longitude });
				},
				(error) => console.error("Error getting location:", error),
				{ enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
			);
		}
		return () => {
			if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
		};
	}, []);

	// Emit location for active orders
	const { data: activeOrders } = useQuery({
		queryKey: ["driverOrders", "active"],
		queryFn: () => axios.get("/orders/active").then((res) => res.data),
		refetchInterval: 10000,
	});

	const { mutate: updateLocation } = useMutation({
		mutationFn: ({ orderId, lat, lng }) => axios.put(`/orders/${orderId}/location`, { lat, lng }),
		onError: (err) => console.error("Failed to update location history:", err),
	});

	useEffect(() => {
		if (socket && location && activeOrders?.length > 0) {
			activeOrders.forEach((order) => {
				if (order.status === "Out for Delivery" || order.status === "Picked Up") {
					// Emit real-time update
					socket.emit("send_location", {
						orderId: order._id,
						lat: location.lat,
						lng: location.lng,
					});
				}
			});
		}
	}, [socket, location, activeOrders]);

	// Persist location every 30 seconds
	useEffect(() => {
		if (location && activeOrders?.length > 0) {
			const interval = setInterval(() => {
				activeOrders.forEach((order) => {
					if (order.status === "Out for Delivery" || order.status === "Picked Up") {
						updateLocation({ orderId: order._id, lat: location.lat, lng: location.lng });
					}
				});
			}, 30000);
			return () => clearInterval(interval);
		}
	}, [location, activeOrders, updateLocation]);

	const { data: availableOrders, isLoading: isLoadingAvailable } = useQuery({
		queryKey: ["driverOrders", "available"],
		queryFn: () => axios.get("/orders/available").then((res) => res.data),
		enabled: activeTab === "available",
        refetchInterval: 15000,
	});

	const { mutate: acceptOrder } = useMutation({
		mutationFn: (orderId) => axios.put(`/orders/${orderId}/accept`),
		onSuccess: () => {
			queryClient.invalidateQueries(["driverOrders"]);
			toast.success("Order accepted!");
			setActiveTab("active");
		},
		onError: (err) => toast.error(err.response?.data?.message || "Failed to accept"),
	});

	const { mutate: updateStatus } = useMutation({
		mutationFn: ({ orderId, status }) => axios.put(`/orders/${orderId}/driver-status`, { status }),
		onSuccess: () => {
			queryClient.invalidateQueries(["driverOrders"]);
			toast.success("Status updated");
		},
		onError: (err) => toast.error(err.response?.data?.message || "Failed to update status"),
	});

	if (isLoadingAvailable && activeTab === "available") return <LoadingSpinner />;

	return (
		<div className='container mx-auto px-4 py-8 max-w-6xl'>
			<h1 className='text-3xl font-bold text-emerald-400 mb-8'>Driver Dashboard</h1>

			<div className='flex mb-6 border-b border-gray-700'>
				<button
					onClick={() => setActiveTab("available")}
					className={`px-6 py-3 font-medium transition-colors ${
						activeTab === "available"
							? "text-emerald-400 border-b-2 border-emerald-400"
							: "text-gray-400 hover:text-white"
					}`}
				>
					Available Orders
				</button>
				<button
					onClick={() => setActiveTab("active")}
					className={`px-6 py-3 font-medium transition-colors ${
						activeTab === "active"
							? "text-emerald-400 border-b-2 border-emerald-400"
							: "text-gray-400 hover:text-white"
					}`}
				>
					My Active Tasks
				</button>
			</div>

			{activeTab === "available" ? (
				<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
					{availableOrders?.length === 0 && <p className='text-gray-400'>No orders available for pickup.</p>}
					{availableOrders?.map((order) => (
						<div key={order._id} className='bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg'>
							<div className='flex justify-between mb-4'>
								<span className='bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold uppercase'>
									{order.status}
								</span>
								<span className='text-gray-400 text-sm'>{new Date(order.createdAt).toLocaleTimeString()}</span>
							</div>
							<h3 className='text-xl font-bold text-white mb-2'>{order.shippingAddress.barangay}, {order.shippingAddress.city}</h3>
							<p className='text-gray-400 mb-4 text-sm'>
								{order.products.length} items • ₱{order.totalAmount.toFixed(2)}
							</p>
							<button
								onClick={() => acceptOrder(order._id)}
								className='w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-bold'
							>
								Accept Order
							</button>
						</div>
					))}
				</div>
			) : (
				<div className='space-y-8'>
					{activeOrders?.length === 0 && <p className='text-gray-400'>No active tasks.</p>}
					{activeOrders?.map((order) => (
						<div key={order._id} className='bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg'>
							<div className='p-6 grid md:grid-cols-2 gap-6'>
								<div>
									<h3 className='text-2xl font-bold text-white mb-2'>Order #{order._id.slice(-6)}</h3>
									<div className='flex items-center space-x-2 mb-4'>
										<span className='bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold uppercase'>
											{order.status}
										</span>
									</div>

									<div className='space-y-3 text-gray-300'>
										<p><strong className='text-white'>Customer:</strong> {order.user?.name}</p>
										<p><strong className='text-white'>Phone:</strong> {order.contactNumber}</p>
										<p><strong className='text-white'>Address:</strong> {order.shippingAddress.sitio}, {order.shippingAddress.barangay}, {order.shippingAddress.city}</p>
										<p><strong className='text-white'>Total to Collect:</strong> ₱{order.paymentMethod === 'cod' ? order.totalAmount.toFixed(2) : '0.00 (Paid)'}</p>
									</div>

									<div className='mt-6 flex space-x-3'>
										{order.status === "Preparing" || order.status === "Ready" ? (
											<button
												onClick={() => updateStatus({ orderId: order._id, status: "Picked Up" })}
												className='flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold'
											>
												Confirm Pickup
											</button>
										) : order.status === "Picked Up" ? (
											<button
												onClick={() => updateStatus({ orderId: order._id, status: "Out for Delivery" })}
												className='flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold'
											>
												Start Delivery
											</button>
										) : order.status === "Out for Delivery" ? (
											<button
												onClick={() => updateStatus({ orderId: order._id, status: "Delivered" })}
												className='flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold'
											>
												Mark Delivered
											</button>
										) : null}
									</div>
								</div>
                                {/* Map */}
								<div className='h-64 md:h-auto bg-gray-900 rounded-lg overflow-hidden relative'>
                                    {/* Usually we show Route here. For now, showing Driver Location marker */}
                                    {location && (
                                        <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            />
                                            <Marker position={[location.lat, location.lng]} icon={driverIcon}>
                                                <Popup>You are here</Popup>
                                            </Marker>
                                        </MapContainer>
                                    )}
                                    {!location && <div className="absolute inset-0 flex items-center justify-center text-gray-500">Getting Location...</div>}
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default DriverDashboard;
