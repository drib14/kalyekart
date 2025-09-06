import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight } from "lucide-react";
import axios from "../lib/axios";
import { useState } from "react";
import toast from "react-hot-toast";

const OrderSummary = () => {
	const { total, subtotal, coupon, isCouponApplied, cart, clearCart } = useCartStore();
	const [paymentMethod, setPaymentMethod] = useState("cod");
	const navigate = useNavigate();

	const savings = subtotal - total;
	const formattedSubtotal = subtotal.toFixed(2);
	const formattedTotal = total.toFixed(2);
	const formattedSavings = savings.toFixed(2);

	const handlePlaceOrder = async () => {
		if (paymentMethod === "gcash") {
			toast.error("GCash payment is not yet available.");
			return;
		}

		if (paymentMethod === "cod") {
			try {
				await axios.post("/payments/cod", {
					products: cart,
					couponCode: coupon ? coupon.code : null,
					totalAmount: total,
				});

				toast.success("Order placed successfully!");
				clearCart();
				navigate("/purchase-success");
			} catch (error) {
				toast.error(error.response?.data?.message || "Failed to place order.");
			}
		}
	};

	return (
		<motion.div
			className='space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<p className='text-xl font-semibold text-emerald-400'>Order summary</p>

			<div className='space-y-4'>
				<div className='space-y-2'>
					<dl className='flex items-center justify-between gap-4'>
						<dt className='text-base font-normal text-gray-300'>Original price</dt>
						<dd className='text-base font-medium text-white'>₱{formattedSubtotal}</dd>
					</dl>

					{savings > 0 && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Savings</dt>
							<dd className='text-base font-medium text-emerald-400'>-₱{formattedSavings}</dd>
						</dl>
					)}

					{coupon && isCouponApplied && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Coupon ({coupon.code})</dt>
							<dd className='text-base font-medium text-emerald-400'>-{coupon.discountPercentage}%</dd>
						</dl>
					)}
					<dl className='flex items-center justify-between gap-4 border-t border-gray-600 pt-2'>
						<dt className='text-base font-bold text-white'>Total</dt>
						<dd className='text-base font-bold text-emerald-400'>₱{formattedTotal}</dd>
					</dl>
				</div>

				<div className='pt-4 border-t border-gray-600'>
					<h3 className='text-lg font-semibold text-white mb-2'>Payment Method</h3>
					<div className='space-y-2'>
						<div className='flex items-center'>
							<input
								id='cod'
								type='radio'
								name='paymentMethod'
								value='cod'
								checked={paymentMethod === "cod"}
								onChange={() => setPaymentMethod("cod")}
								className='h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500'
							/>
							<label htmlFor='cod' className='ml-3 block text-sm font-medium text-white'>
								Cash on Delivery (COD)
							</label>
						</div>
						<div className='flex items-center'>
							<input
								id='gcash'
								type='radio'
								name='paymentMethod'
								value='gcash'
								checked={paymentMethod === "gcash"}
								onChange={() => setPaymentMethod("gcash")}
								className='h-4 w-4 text-emerald-600 border-gray-300 focus:ring-emerald-500'
							/>
							<label htmlFor='gcash' className='ml-3 block text-sm font-medium text-white'>
								GCash <span className='text-xs text-gray-400'>(Coming Soon)</span>
							</label>
						</div>
					</div>
				</div>

				<motion.button
					className='flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300'
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={handlePlaceOrder}
				>
					Place Order
				</motion.button>

				<div className='flex items-center justify-center gap-2'>
					<span className='text-sm font-normal text-gray-400'>or</span>
					<Link
						to='/'
						className='inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline'
					>
						Continue Shopping
						<MoveRight size={16} />
					</Link>
				</div>
			</div>
		</motion.div>
	);
};
export default OrderSummary;
