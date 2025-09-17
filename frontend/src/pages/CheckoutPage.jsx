import { useState } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../lib/axios";

// Mock data for Cebu City addresses
const cebuCityData = {
	"Cebu City": [
		"Adlaon",
		"Agsungot",
		"Apas",
		"Babag",
		"Bacayan",
		"Banilad",
		"Binaliw",
		"Bonbon",
		"Budla-an",
		"Buhisan",
		"Bulacao",
		"Buot",
		"Busay",
		"Calamba",
		"Cambinocot",
		"Kamputhaw (Camputhaw)",
		"Cantimpla",
		"Capitol Site",
		"Carreta",
		"Cogon Pardo",
		"Cogon Ramos",
		"Day-as",
		"Duljo Fatima",
		"Ermita",
		"Guadalupe",
		"Guba",
		"Hippodromo",
		"Inayawan",
		"Kalubihan",
		"Kalunasan",
		"Kamagayan",
		"Kasambagan",
		"Kinasang-an Pardo",
		"Labangon",
		"Lahug",
		"Lorega San Miguel",
		"Lusaran",
		"Luz",
		"Mabini",
		"Mabolo",
		"Malubog",
		"Mang-uab",
		"Pahina Central",
		"Pahina San Nicolas",
		"Pamutan",
		"Pari-an",
		"Paril",
		"Pasil",
		"Pit-os",
		"Poblacion Pardo",
		"Pulangbato",
		"Pung-ol Sibugay",
		"Punta Princesa",
		"Quiot",
		"Sambag I",
		"Sambag II",
		"San Antonio",
		"San Jose",
		"San Nicolas Proper",
		"San Roque",
		"Santa Cruz",
		"Sapangdaku",
		"Sawang Calero",
		"Sinsin",
		"Sirao",
		"Suba",
		"Sudlon I",
		"Sudlon II",
		"T. Padilla",
		"Tabunan",
		"Tagba-o",
		"Talamban",
		"Taptap",
		"Tejero",
		"Tinago",
		"Tisa",
		"To-ong",
		"Zapatera",
	],
};

const CheckoutPage = () => {
	const { user, updateUser } = useUserStore();
	const { cart, total, clearCart } = useCartStore();
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: user?.name || "",
		email: user?.email || "",
		phoneNumber: user?.phoneNumber || "",
		street: user?.address?.street || "",
		city: "Cebu City",
		province: "Cebu",
		zipCode: "6000",
		barangay: user?.address?.barangay || "",
	});
	const [paymentMethod, setPaymentMethod] = useState("COD");

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handlePlaceOrder = async () => {
		if (paymentMethod === "COD") {
			try {
				const shippingAddress = {
					street: formData.street,
					city: formData.city,
					province: formData.province,
					zipCode: formData.zipCode,
					barangay: formData.barangay,
				};

				await axios.post("/orders/cod", {
					products: cart,
					shippingAddress,
					phoneNumber: formData.phoneNumber,
				});

				toast.success("Order placed successfully!");
				updateUser({ address: shippingAddress, phoneNumber: formData.phoneNumber });
				clearCart();
				navigate("/order-success");
			} catch (error) {
				toast.error(error.response?.data?.message || "Failed to place order.");
			}
		} else {
			// Handle other payment methods
			toast.error("This payment method is not yet supported.");
		}
	};

	return (
		<div className='py-8 md:py-16'>
			<div className='mx-auto max-w-screen-xl px-4 2xl:px-0'>
				<motion.div
					className='mx-auto max-w-4xl'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<h2 className='text-2xl font-semibold text-emerald-400 mb-6'>Checkout</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
						<div>
							<h3 className='text-lg font-medium text-white mb-4'>Shipping Information</h3>
							<div className='space-y-4'>
								<input
									type='text'
									name='name'
									placeholder='Full Name'
									value={formData.name}
									onChange={handleInputChange}
									className='w-full p-2 bg-gray-800 border border-gray-700 rounded-md'
								/>
								<input
									type='email'
									name='email'
									placeholder='Email'
									value={formData.email}
									onChange={handleInputChange}
									className='w-full p-2 bg-gray-800 border border-gray-700 rounded-md'
								/>
								<input
									type='text'
									name='phoneNumber'
									placeholder='Phone Number'
									value={formData.phoneNumber}
									onChange={handleInputChange}
									className='w-full p-2 bg-gray-800 border border-gray-700 rounded-md'
								/>
								<input
									type='text'
									name='street'
									placeholder='Street Address'
									value={formData.street}
									onChange={handleInputChange}
									className='w-full p-2 bg-gray-800 border border-gray-700 rounded-md'
								/>
								<select
									name='city'
									value={formData.city}
									onChange={handleInputChange}
									className='w-full p-2 bg-gray-800 border border-gray-700 rounded-md'
								>
									{Object.keys(cebuCityData).map((city) => (
										<option key={city} value={city}>
											{city}
										</option>
									))}
								</select>
								<select
									name='barangay'
									value={formData.barangay}
									onChange={handleInputChange}
									className='w-full p-2 bg-gray-800 border border-gray-700 rounded-md'
								>
									<option value=''>Select Barangay</option>
									{cebuCityData[formData.city]?.map((barangay) => (
										<option key={barangay} value={barangay}>
											{barangay}
										</option>
									))}
								</select>
								<input
									type='text'
									name='province'
									placeholder='Province'
									value={formData.province}
									readOnly
									className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md'
								/>
								<input
									type='text'
									name='zipCode'
									placeholder='Zip Code'
									value={formData.zipCode}
									readOnly
									className='w-full p-2 bg-gray-700 border border-gray-600 rounded-md'
								/>
							</div>
						</div>
						<div>
							<h3 className='text-lg font-medium text-white mb-4'>Payment Method</h3>
							<div className='space-y-4'>
								<div
									className={`p-4 border rounded-md cursor-pointer ${
										paymentMethod === "COD" ? "border-emerald-500" : "border-gray-700"
									}`}
									onClick={() => setPaymentMethod("COD")}
								>
									<p className='font-semibold'>Cash on Delivery</p>
								</div>
								{/* Placeholder for other payment methods */}
								<div className='flex space-x-4'>
									<div
										className={`flex items-center p-4 border rounded-md cursor-pointer opacity-50 ${
											paymentMethod === "Stripe" ? "border-emerald-500" : "border-gray-700"
										}`}
									>
										<img src='/stripe.svg' alt='Stripe' className='w-12 h-auto mr-4' />
										<p className='font-semibold'>Stripe</p>
									</div>
									<div
										className={`flex items-center p-4 border rounded-md cursor-pointer opacity-50 ${
											paymentMethod === "PayMongo" ? "border-emerald-500" : "border-gray-700"
										}`}
									>
										<img src='/paymongo.svg' alt='PayMongo' className='w-12 h-auto mr-4' />
										<p className='font-semibold'>PayMongo</p>
									</div>
								</div>
							</div>
							<div className='mt-8'>
								<h3 className='text-lg font-medium text-white mb-4'>Order Summary</h3>
								<div className='space-y-2'>
									{cart.map((item) => (
										<div key={item._id} className='flex justify-between'>
											<p>
												{item.name} x {item.quantity}
											</p>
											<p>PHP{(item.price * item.quantity).toFixed(2)}</p>
										</div>
									))}
									<div className='flex justify-between font-bold'>
										<p>Total</p>
										<p>PHP{total.toFixed(2)}</p>
									</div>
								</div>
								<button
									onClick={handlePlaceOrder}
									className='w-full mt-6 bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700'
								>
									Place Order
								</button>
							</div>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default CheckoutPage;
