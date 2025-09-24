import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getCebuCitiesAndMunicipalities, getBarangays } from "../api/psgc";
import { getCoordinates } from "../api/openstreetmap";

const CheckoutPage = () => {
	const { cart, subtotal, total, coupon } = useCartStore();
	const { user } = useUserStore();
	const navigate = useNavigate();

	const [fullName, setFullName] = useState(user?.name || "");
	const [streetAddress, setStreetAddress] = useState("");
	const [city, setCity] = useState("");
	const [barangay, setBarangay] = useState("");
	const [province, setProvince] = useState("Cebu");
	const [postalCode, setPostalCode] = useState("");
	const [contactNumber, setContactNumber] = useState(user?.phoneNumber || "");
	const [deliveryFee, setDeliveryFee] = useState(0);
	const [finalTotal, setFinalTotal] = useState(total);
	const [customerCoords, setCustomerCoords] = useState(null);
	const [distance, setDistance] = useState(0);

	const [municipalities, setMunicipalities] = useState([]);
	const [barangays, setBarangays] = useState([]);

	const storeLocation = { lat: 10.3085, lng: 123.883 }; // Hardcoded store location

	const haversineDistance = (coords1, coords2) => {
		const toRad = (x) => (x * Math.PI) / 180;
		const R = 6371; // Earth radius in km

		const dLat = toRad(coords2.lat - coords1.lat);
		const dLon = toRad(coords2.lng - coords1.lng);
		const lat1 = toRad(coords1.lat);
		const lat2 = toRad(coords2.lat);

		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c; // Distance in km
	};

	useEffect(() => {
		const fetchCebuCitiesAndMunicipalities = async () => {
			const data = await getCebuCitiesAndMunicipalities();
			setMunicipalities(data);
		};
		fetchCebuCitiesAndMunicipalities();
	}, []);

	useEffect(() => {
		const fetchBarangays = async () => {
			if (city) {
				const selectedCity = municipalities.find((m) => m.name === city);
				if (selectedCity) {
					const data = await getBarangays(selectedCity.code);
					setBarangays(data);
					setPostalCode(selectedCity.zip_code || "");
				}
			}
		};
		fetchBarangays();
	}, [city, municipalities]);

	useEffect(() => {
		const calculateFee = async () => {
			if (!barangay || !city) {
				setDeliveryFee(0);
				setDistance(0);
				return;
			}

			let coords = null;
			try {
				const cleanedCity = city.replace(/^(City of|Municipality of)\s*/, "");
				const query = `${barangay}, ${cleanedCity}, Cebu, Philippines`;
				const data = await getCoordinates(query);
				if (data.length > 0) {
					coords = {
						lat: parseFloat(data[0].lat),
						lng: parseFloat(data[0].lon),
					};
				}
			} catch (e) {
				console.error("Error fetching coordinates:", e);
				toast.error("Could not fetch location data. Using fallback calculation.");
			}

			if (!coords) {
				// Fallback to city
				try {
					toast.error("Could not find the exact address. Using city center for delivery fee calculation.");
					const cleanedCity = city.replace(/^(City of|Municipality of)\s*/, "");
					const cityQuery = `${cleanedCity}, Cebu, Philippines`;
					const cityData = await getCoordinates(cityQuery);
					if (cityData.length > 0) {
						coords = {
							lat: parseFloat(cityData[0].lat),
							lng: parseFloat(cityData[0].lon),
						};
					}
				} catch (e) {
					console.error("Error fetching city coordinates:", e);
					toast.error("Could not fetch city location data.");
				}
			}

			if (coords) {
				const dist = haversineDistance(storeLocation, coords);
				setDistance(dist);
				let fee = 0;
				if (dist <= 10) {
					fee = 15 + dist * 2;
				} else if (dist > 10 && dist <= 20) {
					fee = 25 + dist * 3;
				} else {
					fee = 50 + dist * 4;
				}
				setDeliveryFee(Math.round(fee));
			} else {
				setDeliveryFee(0);
				setDistance(0);
			}
		};

		const handler = setTimeout(() => {
			calculateFee();
		}, 1000); // Debounce for 1 second

		return () => {
			clearTimeout(handler);
		};
	}, [barangay, city, storeLocation]);

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
			barangay,
			province,
			postalCode,
		};

		createCodOrder({
			products,
			shippingAddress,
			contactNumber,
			couponCode: coupon?.code,
			subtotal,
			deliveryFee,
			distance,
			totalAmount: finalTotal,
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
										{municipalities.map((m) => (
											<option key={m.code} value={m.name}>
												{m.name}
											</option>
										))}
									</select>
								</div>
								<div>
									<label htmlFor='barangay' className='block text-sm font-medium text-gray-300 mb-1'>
										Barangay
									</label>
									<select
										id='barangay'
										required
										value={barangay}
										onChange={(e) => setBarangay(e.target.value)}
										className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm'
									>
										<option value=''>Select a barangay</option>
										{barangays.map((b) => (
											<option key={b.code} value={b.name}>
												{b.name}
											</option>
										))}
									</select>
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
									<label htmlFor='postalCode' className='block text-sm font-medium text-gray-300 mb-1'>
										Postal Code
									</label>
									<input
										id='postalCode'
										type='text'
										required
										value={postalCode}
										onChange={(e) => setPostalCode(e.target.value)}
										className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm'
										readOnly
									/>
								</div>
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
								<span>₱{deliveryFee}</span>
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