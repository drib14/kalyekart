import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AddonsModal from "../components/AddonsModal";

const CheckoutPage = () => {
	const { cart, clearCart, subtotal, total, coupon } = useCartStore();
	const { user } = useUserStore();
	const navigate = useNavigate();

	const [shippingAddress, setShippingAddress] = useState("123 Kalye Serye, Barangay Walang Forever, Cebu City");
	const [contactNumber, setContactNumber] = useState("09123456789");
	const [isAddonsModalOpen, setIsAddonsModalOpen] = useState(false);

	const { mutate: createCodOrder, isPending } = useMutation({
		mutationFn: (data) => {
			return axios.post("/orders/cod", data);
		},
		onSuccess: () => {
			toast.success("Order placed successfully");
			clearCart();
			navigate("/purchase-success");
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
		createCodOrder({ products, shippingAddress, contactNumber, couponCode: coupon?.code });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setIsAddonsModalOpen(true);
	};

	return (
		<main className='container my-10'>
			{isAddonsModalOpen && <AddonsModal onClose={handlePlaceOrder} />}
			<motion.div
				className='max-w-4xl mx-auto'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<h1 className='text-3xl font-extrabold text-emerald-400 mb-8 text-center'>Checkout</h1>
				<div className='grid md:grid-cols-2 gap-8'>
					<div className='bg-gray-800 p-8 rounded-lg shadow-lg'>
						<h2 className='text-2xl font-bold text-white mb-6'>Shipping Information</h2>
						<form onSubmit={handleSubmit} className='space-y-6'>
							<div>
								<label htmlFor='shippingAddress' className='block text-sm font-medium text-gray-300 mb-1'>
									Shipping Address
								</label>
								<textarea
									id='shippingAddress'
									rows={4}
									required
									value={shippingAddress}
									onChange={(e) => setShippingAddress(e.target.value)}
									className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
									placeholder='Enter your full address (Cebu-based)'
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
									className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm'
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
