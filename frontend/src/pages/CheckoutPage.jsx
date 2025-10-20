import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, CreditCard, Truck } from "lucide-react";
import DiscountCodeInput from "../components/DiscountCodeInput";
import AvailableDiscounts from "../components/AvailableDiscounts";

const CheckoutPage = () => {
	const { cart, subtotal, total, appliedDiscount, discountAmount } = useCartStore();
	const { user } = useUserStore();
	const navigate = useNavigate();

	const [paymentMethod, setPaymentMethod] = useState("cod");
	const [distance, setDistance] = useState(0);
	const [deliveryInfo, setDeliveryInfo] = useState({
		fullName: user?.name || "",
		contactNumber: user?.phoneNumber || "",
		sitio: "",
		barangay: "",
		city: "",
		province: "Cebu",
		postalCode: "",
	});
	const [deliveryFee, setDeliveryFee] = useState(0);
	const [finalTotal, setFinalTotal] = useState(total);

	const [locations, setLocations] = useState([]);
	const [barangays, setBarangays] = useState([]);
	const [isLocating, setIsLocating] = useState(false);

	const { data: savedAddresses, isLoading: isLoadingAddresses } = useQuery({
		queryKey: ["deliveryAddresses"],
		queryFn: () => axios.get("/users/addresses").then((res) => res.data),
		enabled: !!user,
	});

	useEffect(() => {
		const fetchLocations = async () => {
			try {
				const response = await axios.get("/locations/cities-municipalities");
				setLocations(response.data);
			} catch {
				toast.error("Failed to fetch locations.");
			}
		};
		fetchLocations();
	}, []);

	useEffect(() => {
		if (deliveryInfo.city) {
			const selectedLocation = locations.find((loc) => loc.name === deliveryInfo.city);
			if (selectedLocation) {
				const fetchBarangays = async () => {
					try {
						const response = await axios.get(`/locations/barangays/${selectedLocation.code}`);
						setBarangays(response.data);
						setDeliveryInfo((prev) => ({ ...prev, postalCode: selectedLocation.zip_code || "" }));
					} catch {
						toast.error("Failed to fetch barangays.");
					}
				};
				fetchBarangays();
			}
		} else {
			setBarangays([]);
			setDeliveryInfo((prev) => ({ ...prev, postalCode: "" }));
		}
	}, [deliveryInfo.city, locations]);

	useEffect(() => {
		if (deliveryInfo.city && deliveryInfo.barangay) {
			const handler = setTimeout(async () => {
				try {
					const response = await axios.post("/locations/calculate-fee", {
						shippingAddress: { city: deliveryInfo.city, barangay: deliveryInfo.barangay },
					});
					setDeliveryFee(response.data.deliveryFee);
					setDistance(response.data.distance || 0);
				} catch {
					toast.error("Could not calculate delivery fee.");
					setDeliveryFee(0);
					setDistance(0);
				}
			}, 500);

			return () => clearTimeout(handler);
		}
	}, [deliveryInfo.city, deliveryInfo.barangay]);

	useEffect(() => {
		setFinalTotal(total + deliveryFee);
	}, [total, deliveryFee]);

	const handleSelectSavedAddress = (address) => {
		setDeliveryInfo({
			fullName: address.fullName,
			contactNumber: address.contactNumber,
			sitio: address.sitio,
			barangay: address.barangay,
			city: address.city,
			province: address.province,
			postalCode: address.postalCode,
		});
		toast.success("Delivery information filled from saved address.");
	};

	const { mutate: createCodOrder, isPending } = useMutation({
		mutationFn: (data) => axios.post("/orders/cod", data),
		onSuccess: (data) => navigate(`/purchase-success`, { state: { cod: true, orderId: data.data.orderId } }),
		onError: (error) => toast.error(error.response.data.message),
	});

	const { mutate: createPaymongoSession, isPending: isPaymongoPending } = useMutation({
		mutationFn: (data) => axios.post("/payments/create-paymongo-checkout-session", data),
		onSuccess: (data) => {
			sessionStorage.setItem("paymongoSessionId", data.data.id);
			window.location.href = data.data.url;
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Could not proceed to payment.");
		},
	});

	const handleUseCurrentLocation = async () => {
		if (!navigator.geolocation) {
			toast.error("Geolocation is not supported by your browser.");
			return;
		}
		setIsLocating(true);
		try {
			const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
			const { latitude, longitude } = position.coords;
			const geocodeResponse = await axios.post("/locations/reverse-geocode", { lat: latitude, lon: longitude });
			const address = geocodeResponse.data;
			const apiCityName = address.city || address.town || address.county || "";
			const normalize = (str) => str.replace(/City of|City/g, "").replace(/-/g, " ").trim().toLowerCase();
			const normalizedApiCity = normalize(apiCityName);

			const matchedLocation = locations.find((loc) => {
				const normalizedLocName = normalize(loc.name);
				return normalizedLocName.includes(normalizedApiCity) || normalizedApiCity.includes(normalizedLocName);
			});

			if (!matchedLocation) {
				toast.error("Could not match your city. Please select it manually.");
				return;
			}

			const newCity = matchedLocation.name;
			const barangayResponse = await axios.get(`/locations/barangays/${matchedLocation.code}`);
			const fetchedBarangays = barangayResponse.data;
			setBarangays(fetchedBarangays);

			const apiBarangayName = address.village || address.suburb || address.hamlet || address.quarter;
			let newBarangay = "";
			if (apiBarangayName) {
				const normalizeBarangay = (str) => str.trim().toLowerCase();
				const normalizedTarget = normalizeBarangay(apiBarangayName);
				const matchedBarangay = fetchedBarangays.find(
					(b) => normalizeBarangay(b.name).includes(normalizedTarget) || normalizedTarget.includes(normalizeBarangay(b.name))
				);
				if (matchedBarangay) newBarangay = matchedBarangay.name;
			}

			setDeliveryInfo((prev) => ({
				...prev,
				city: newCity,
				barangay: newBarangay,
				sitio: [address.road, address.house_number].filter(Boolean).join(", "),
				postalCode: matchedLocation.zip_code || "",
			}));
		} catch (error) {
			toast.error(
				error.code === error.PERMISSION_DENIED
					? "Unable to retrieve your location. Please enable location services."
					: "Could not determine your address. Please enter it manually."
			);
		} finally {
			setIsLocating(false);
		}
	};

	const handleInputChange = (e) => {
		const { id, value } = e.target;
		setDeliveryInfo((prev) => ({ ...prev, [id]: value }));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (cart.length === 0) {
			toast.error("Your cart is empty.");
			return;
		}

		const orderDetails = {
			products: cart.map((item) => ({
				_id: item.product._id,
				name: item.product.name,
				image: item.product.image,
				price: item.product.price,
				quantity: item.quantity,
			})),
			shippingAddress: deliveryInfo,
			contactNumber: deliveryInfo.contactNumber,
			discountCode: appliedDiscount?.code,
			distance: distance,
			deliveryFee: deliveryFee,
			subtotal: subtotal,
		};

		if (paymentMethod === "cod") {
			createCodOrder(orderDetails);
		} else {
			createPaymongoSession({ ...orderDetails, paymentMethod });
		}
	};

	const onlinePaymentOptions = [
		{ id: "card", name: "Card", icon: <CreditCard className='h-8 w-8' /> },
		{ id: "gcash", name: "GCash", icon: <img src='/gcash.avif' alt='GCash' className='h-8 w-8 rounded-md' /> },
		{ id: "paymaya", name: "Maya", icon: <img src='/maya.png' alt='Maya' className='h-8 w-8 rounded-md' /> },
		{ id: "grab_pay", name: "GrabPay", icon: <img src='/g-pay.png' alt='GrabPay' className='h-8 w-8 rounded-md' /> },
	];

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
						<div className='flex justify-between items-center mb-4'>
							<h2 className='text-2xl font-bold text-white'>Delivery Information</h2>
							<button
								type='button'
								onClick={handleUseCurrentLocation}
								className='text-sm font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-50 flex items-center'
								disabled={isLocating || locations.length === 0}
							>
								<MapPin className='w-4 h-4 mr-1' />
								{isLocating ? "Locating..." : "Use Current Location"}
							</button>
						</div>
						{isLoadingAddresses ? (
							<LoadingSpinner />
						) : (
							savedAddresses &&
							savedAddresses.length > 0 && (
								<div className='mb-4'>
									<label className='block text-sm font-medium text-gray-300 mb-1'>Use a saved address</label>
									<div className='flex flex-wrap gap-2'>
										{savedAddresses.map((addr) => (
											<button
												key={addr._id}
												type='button'
												onClick={() => handleSelectSavedAddress(addr)}
												className={`px-3 py-1 text-sm rounded-full border ${
													addr.isDefault
														? "bg-emerald-500 border-emerald-400 text-white"
														: "bg-gray-700 border-gray-600 hover:bg-gray-600"
												}`}
											>
												{addr.fullName} - {addr.barangay}
											</button>
										))}
									</div>
								</div>
							)
						)}
						<form onSubmit={handleSubmit} className='space-y-4'>
							<div>
								<label htmlFor='fullName' className='block text-sm font-medium text-gray-300 mb-1'>
									Full Name
								</label>
								<input
									id='fullName'
									type='text'
									required
									value={deliveryInfo.fullName}
									onChange={handleInputChange}
									className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
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
									value={deliveryInfo.contactNumber}
									onChange={handleInputChange}
									className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
									placeholder='09123456789'
								/>
							</div>
							<div>
								<label htmlFor='sitio' className='block text-sm font-medium text-gray-300 mb-1'>
									Sitio / Street / House No. (Optional)
								</label>
								<input
									id='sitio'
									type='text'
									value={deliveryInfo.sitio}
									onChange={handleInputChange}
									className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
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
										value={deliveryInfo.city}
										onChange={handleInputChange}
										className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
									>
										<option value=''>Select a city</option>
										{locations.map((loc) => (
											<option key={loc.code} value={loc.name}>
												{loc.name}
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
										value={deliveryInfo.barangay}
										onChange={handleInputChange}
										className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
										disabled={!deliveryInfo.city}
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
										value={deliveryInfo.province}
										onChange={handleInputChange}
										className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
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
										value={deliveryInfo.postalCode}
										readOnly
										placeholder='e.g. 6000'
										className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
									/>
								</div>
							</div>
							<div className='pt-4'>
								<h3 className='text-lg font-medium text-white mb-2'>Payment Method</h3>
								<div className='space-y-4'>
									<button
										type='button'
										onClick={() => setPaymentMethod("cod")}
										className={`w-full flex items-center justify-center p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${
											paymentMethod === "cod"
												? "bg-emerald-500 border-emerald-400 text-white shadow-lg"
												: "bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-300"
										}`}
									>
										<Truck className='w-6 h-6 mr-3' />
										<span className='font-medium'>Cash on Delivery</span>
									</button>

									<div className='flex items-center'>
										<div className='flex-grow border-t border-gray-600'></div>
										<span className='flex-shrink mx-4 text-gray-400 text-sm'>OR PAY WITH</span>
										<div className='flex-grow border-t border-gray-600'></div>
									</div>

									<div className='relative'>
										<div className={`grid grid-cols-4 gap-2 opacity-50 cursor-not-allowed`}>
											{onlinePaymentOptions.map((option) => (
												<div key={option.id} className='relative group'>
													<button
														type='button'
														className={`w-full h-[60px] flex items-center justify-center p-3 rounded-lg border-2 bg-gray-700 border-gray-600`}
														disabled={true}
													>
														{option.icon}
													</button>
													<div
														className='absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-gray-900 bg-opacity-80 text-white text-xs rounded-md
                                                   opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10'
													>
														{option.name}
													</div>
												</div>
											))}
										</div>
										<p className='text-xs text-center text-yellow-400 mt-2'>
											Online payments are coming soon!
										</p>
									</div>
								</div>
							</div>
							<div className='pt-6'>
								<button
									type='submit'
									className='w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700'
									disabled={isPending || isPaymongoPending || cart.length === 0}
								>
									{isPending || isPaymongoPending ? (
										<LoadingSpinner />
									) : paymentMethod === "cod" ? (
										"Place Order"
									) : (
										"Proceed to Payment"
									)}
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
												className='w-16 h-16 object-cover rounded-lg mr-4'
											/>
											<div>
												<p className='font-medium text-white'>{item.product.name}</p>
												<p className='text-sm text-gray-400'>
													{item.quantity} x ₱{item.product.price.toFixed(2)}
												</p>
											</div>
										</div>
										<p className='font-medium text-white'>₱{(item.quantity * item.product.price).toFixed(2)}</p>
									</div>
								))}
						</div>
						<div className='border-t border-gray-700 my-6' />
						<div className='space-y-2'>
							<div className='flex justify-between text-gray-300'>
								<span>Subtotal</span>
								<span>₱{subtotal.toFixed(2)}</span>
							</div>
							{appliedDiscount && (
								<div className='flex justify-between text-emerald-400'>
									<span>Discount ({appliedDiscount.code})</span>
									<span>-₱{discountAmount.toFixed(2)}</span>
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
						<DiscountCodeInput deliveryFee={deliveryFee} />
						<AvailableDiscounts deliveryFee={deliveryFee} />
					</div>
				</div>
			</motion.div>
		</main>
	);
};

export default CheckoutPage;