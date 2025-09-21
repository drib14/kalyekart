import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CheckoutPage = () => {
	const { cart, clearCart, subtotal, total, coupon } = useCartStore();
	const { user } = useUserStore();
	const navigate = useNavigate();

	const [paymentMethod, setPaymentMethod] = useState("card");
	const [billing, setBilling] = useState({
		name: user?.name || "",
		email: user?.email || "",
		phone: "",
		address: {
			line1: "",
			city: "",
			state: "Cebu",
			postal_code: "",
		},
	});

	const [isProcessingPayment, setIsProcessingPayment] = useState(false);

	const { mutate: createPayment, isPending } = useMutation({
		mutationFn: (data) => {
			return axios.post("/payment/create-payment", data);
		},
		onSuccess: async (data) => {
			if (paymentMethod === "cod") {
				toast.success("Order placed successfully");
				clearCart();
				navigate("/purchase-success");
				return;
			}

			// Handle PayMongo payment
			const { clientKey, orderId } = data.data;
			setIsProcessingPayment(true);

			const paymongo = new window.Paymongo(import.meta.env.VITE_PAYMONGO_PUBLIC_KEY);
			const { paymentIntentId, error } = await paymongo.authenticate(clientKey);

			if (error) {
				toast.error(error.message);
				setIsProcessingPayment(false);
				return;
			}

			await axios.post("/payment/verify-payment", { orderId, paymentIntentId });

			toast.success("Payment successful!");
			clearCart();
			navigate("/purchase-success");
			setIsProcessingPayment(false);
		},
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		const products = cart.map((item) => ({
			_id: item.product._id,
			name: item.product.name,
			price: item.product.price,
			quantity: item.quantity,
			image: item.product.image,
			description: item.product.description,
		}));
		createPayment({ products, paymentMethod, billing, couponCode: coupon?.code });
	};

	const handleBillingChange = (e) => {
		const { name, value } = e.target;
		if (name.includes(".")) {
			const [parent, child] = name.split(".");
			setBilling((prev) => ({
				...prev,
				[parent]: {
					...prev[parent],
					[child]: value,
				},
			}));
		} else {
			setBilling((prev) => ({
				...prev,
				[name]: value,
			}));
		}
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
				<div className='grid md:grid-cols-2 gap-8'>
					<div className='bg-gray-800 p-8 rounded-lg shadow-lg'>
						<h2 className='text-2xl font-bold text-white mb-6'>Billing Information</h2>
						<form onSubmit={handleSubmit} className='space-y-6'>
							<div className='grid md:grid-cols-2 gap-6'>
								<div>
									<label htmlFor='name' className='block text-sm font-medium text-gray-300 mb-1'>
										Full Name
									</label>
									<input
										id='name'
										name='name'
										required
										value={billing.name}
										onChange={handleBillingChange}
										className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
									/>
								</div>
								<div>
									<label htmlFor='email' className='block text-sm font-medium text-gray-300 mb-1'>
										Email
									</label>
									<input
										id='email'
										name='email'
										type='email'
										required
										value={billing.email}
										onChange={handleBillingChange}
										className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
									/>
								</div>
							</div>
							<div>
								<label htmlFor='phone' className='block text-sm font-medium text-gray-300 mb-1'>
									Phone Number
								</label>
								<input
									id='phone'
									name='phone'
									required
									value={billing.phone}
									onChange={handleBillingChange}
									className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
								/>
							</div>
							<div>
								<label htmlFor='line1' className='block text-sm font-medium text-gray-300 mb-1'>
									Address
								</label>
								<input
									id='line1'
									name='address.line1'
									required
									value={billing.address.line1}
									onChange={handleBillingChange}
									className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
								/>
							</div>
							<div className='grid md:grid-cols-2 gap-6'>
								<div>
									<label htmlFor='city' className='block text-sm font-medium text-gray-300 mb-1'>
										City
									</label>
									<input
										id='city'
										name='address.city'
										required
										value={billing.address.city}
										onChange={handleBillingChange}
										className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
									/>
								</div>
								<div>
									<label
										htmlFor='postal_code'
										className='block text-sm font-medium text-gray-300 mb-1'
									>
										Postal Code
									</label>
									<input
										id='postal_code'
										name='address.postal_code'
										required
										value={billing.address.postal_code}
										onChange={handleBillingChange}
										className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
									/>
								</div>
							</div>

							<div className='pt-6'>
								<h3 className='text-xl font-bold text-white mb-4'>Payment Method</h3>
								<div className='space-y-4'>
									<label
										htmlFor='card'
										className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
											paymentMethod === "card" ? "border-emerald-500 bg-emerald-900/50" : "border-gray-600"
										}`}
									>
										<input
											id='card'
											type='radio'
											name='paymentMethod'
											value='card'
											checked={paymentMethod === "card"}
											onChange={(e) => setPaymentMethod(e.target.value)}
											className='hidden'
										/>
										<span className='text-lg font-medium text-white'>Pay with Card / GCash</span>
									</label>
									<label
										htmlFor='cod'
										className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
											paymentMethod === "cod" ? "border-emerald-500 bg-emerald-900/50" : "border-gray-600"
										}`}
									>
										<input
											id='cod'
											type='radio'
											name='paymentMethod'
											value='cod'
											checked={paymentMethod === "cod"}
											onChange={(e) => setPaymentMethod(e.target.value)}
											className='hidden'
										/>
										<span className='text-lg font-medium text-white'>Cash on Delivery</span>
									</label>
								</div>
							</div>

							<div className='pt-6'>
								<button
									type='submit'
									className='w-full flex justify-center py-3 px-4 border border-transparent
									rounded-md shadow-sm text-lg font-medium text-white bg-emerald-600
									 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
									  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50'
									disabled={isPending || cart.length === 0 || isProcessingPayment}
								>
									{isPending || isProcessingPayment ? <LoadingSpinner /> : "Place Order"}
								</button>
							</div>
						</form>
					</div>
					<div className='bg-gray-800 p-8 rounded-lg shadow-lg'>
						<h2 className='text-2xl font-bold text-white mb-6'>Order Summary</h2>
						<div className='space-y-4'>
							{cart.map((item) => (
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
							<div className='flex justify-between font-bold text-xl text-white pt-2'>
								<span>Total</span>
								<span>₱{total.toFixed(2)}</span>
							</div>
						</div>
					</div>
				</div>
			</motion.div>
		</main>
	);
};

export default CheckoutPage;
