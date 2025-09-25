import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CheckoutPage = () => {
	const { cart, subtotal, total, coupon } = useCartStore();
	const { user } = useUserStore();
	const navigate = useNavigate();

	const [fullName, setFullName] = useState(user?.name || "");
	const [streetAddress, setStreetAddress] = useState("");
	const [city, setCity] = useState("");
	const [province, setProvince] = useState("Cebu");
	const [postalCode, setPostalCode] = useState(""); // This can be improved later
	const [contactNumber, setContactNumber] = useState(user?.phoneNumber || "");
	const [deliveryFee, setDeliveryFee] = useState(0);
	const [finalTotal, setFinalTotal] = useState(total);

	const [locations, setLocations] = useState([]);

	// Fetch locations on component mount
	useEffect(() => {
		const fetchLocations = async () => {
			try {
				const response = await axios.get("/api/delivery/locations");
				setLocations(response.data);
			} catch (error) {
				toast.error("Failed to fetch locations.");
			}
		};
		fetchLocations();
	}, []);

	// Fetch delivery fee when city changes
	useEffect(() => {
		if (city) {
			const fetchFee = async () => {
				try {
					const response = await axios.post("/api/delivery/calculate-fee", {
						shippingAddress: { city },
					});
					setDeliveryFee(response.data.deliveryFee);
				} catch (error) {
					toast.error("Could not calculate delivery fee.");
					setDeliveryFee(0);
				}
			};
			fetchFee();
		} else {
			setDeliveryFee(0);
		}
	}, [city]);

	// Update final total when delivery fee or cart total changes
	useEffect(() => {
		setFinalTotal(total + deliveryFee);
	}, [total, deliveryFee]);

	const { mutate: createCodOrder, isPending } = useMutation({
		mutationFn: (data) => {
			return axios.post("/orders/cod", data);
		},
		onSuccess: (data) => {
			navigate(`/purchase-success`, { state: { cod: true, orderId: data.data.orderId } });
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	const handlePlaceOrder = () => {
		const products = cart.map((item) => ({
			_id: item.product._id,
			name: item.product.name,
			price: item.product.price,
			quantity: item.quantity,
		}));

		const shippingAddress = {
			fullName,
			streetAddress,
			city,
			province,
			postalCode,
		};

		createCodOrder({
			products,
			shippingAddress,
			contactNumber,
			couponCode: coupon?.code,
			subtotal,
			// No deliveryFee or totalAmount sent, backend calculates them
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		handlePlaceOrder();
	};

	return (
		<main className='container my-10'>
			<motion.div
				className='max-w-4xl mx-auto'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<h1 className='text-3xl font-extrabold text-emerald-400 mb-8 text-center'>Checkout</h1>
				<div className='grid md:grid-cols-2 md:gap-4 lg:gap-8'>
					<div className='bg-gray-800 p-8 rounded-lg shadow-lg'>
						<h2 className='text-2xl font-bold text-white mb-6'>Shipping Information</h2>
						<form onSubmit={handleSubmit} className='space-y-4'>
							<div>
								<label htmlFor='fullName' className='block text-sm font-medium text-gray-300 mb-1'>
									Full Name
								</label>
								<input
									id='fullName'
									type='text'
									required
									value={fullName}
									onChange={(e) => setFullName(e.target.value)}
									className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm'
								/>
							</div>
							<div>
								<label
									htmlFor='streetAddress'
									className='block text-sm font-medium text-gray-300 mb-1'
								>
									Street Address
								</label>
								<input
									id='streetAddress'
									type='text'
									required
									value={streetAddress}
									onChange={(e) => setStreetAddress(e.target.value)}
									className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm'
								/>
							</div>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label htmlFor='city' className='block text-sm font-medium text-gray-300 mb-1'>
										City / Municipality
									</label>
									<select
										id='city'
										required
										value={city}
										onChange={(e) => setCity(e.target.value)}
										className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm'
									>
										<option value=''>Select a city</option>
										{locations.map((loc) => (
											<option key={loc} value={loc}>
												{loc}
											</option>
										))}
									</select>
								</div>
								<div>
									<label htmlFor='postalCode' className='block text-sm font-medium text-gray-300 mb-1'>
										Postal Code
									</label>
									<input
										id='postalCode'
										type='text'
										value={postalCode}
										onChange={(e) => setPostalCode(e.target.value)}
										className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm'
										placeholder='e.g. 6000'
									/>
								</div>
							</div>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label htmlFor='province' className='block text-sm font-medium text-gray-300 mb-1'>
										Province
									</label>
									<input
										id='province'
										type='text'
										required
										value={province}
										onChange={(e) => setProvince(e.target.value)}
										className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm'
										disabled
									/>
								</div>
								<div>
									<label htmlFor='contactNumber' className='block text-sm font-medium text-gray-300 mb-1'>
										Contact Number
									</label>
									<input
										id='contactNumber'
										type='text'
										required
										value={contactNumber}
										onChange={(e) => setContactNumber(e.target.value)}
										className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm'
										placeholder='09123456789'
									/>
								</div>
							</div>

							<div className='pt-6'>
								<button
									type='submit'
									className='w-full flex justify-center py-3 px-4 border border-transparent
									rounded-md shadow-sm text-lg font-medium text-white bg-emerald-600
									 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
									  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50'
									disabled={isPending || cart.length === 0}
								>
									{isPending ? <LoadingSpinner /> : "Place Order (Cash on Delivery)"}
								</button>
							</div>
						</form>
					</div>
					<div className='bg-gray-800 p-8 rounded-lg shadow-lg'>
						<h2 className='text-2xl font-bold text-white mb-6'>Order Summary</h2>
						<div className='space-y-4'>
							{cart
								.filter((item) => item && item.product)
								.map((item) => (
									<div key={item.product._id} className='flex items-center justify-between'>
										<div className='flex items-center'>
											<img
												src={item.product.image}
												alt={item.product.name}
												className='w-16 h-16 object-cover rounded-md mr-4'
											/>
											<div>
												<p className='font-medium text-white'>{item.product.name}</p>
												<p className='text-sm text-gray-400'>
													{item.quantity} x ₱{item.product.price.toFixed(2)}
												</p>
											</div>
										</div>
										<p className='font-medium text-white'>
											₱{(item.quantity * item.product.price).toFixed(2)}
										</p>
									</div>
								))}
						</div>
						<div className='border-t border-gray-700 my-6' />
						<div className='space-y-2'>
							<div className='flex justify-between text-gray-300'>
								<span>Subtotal</span>
								<span>₱{subtotal.toFixed(2)}</span>
							</div>
							{coupon && (
								<div className='flex justify-between text-emerald-400'>
									<span>Discount ({coupon.code})</span>
									<span>-{coupon.discountPercentage}%</span>
								</div>
							)}
							<div className='flex justify-between text-gray-300'>
								<span>Delivery Fee</span>
								<span>₱{deliveryFee.toFixed(2)}</span>
							</div>
							<div className='flex justify-between font-bold text-xl text-white pt-2'>
								<span>Total</span>
								<span>₱{finalTotal.toFixed(2)}</span>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</main>
	);
};

export default CheckoutPage;