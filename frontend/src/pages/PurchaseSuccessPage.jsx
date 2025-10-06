import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowRight, CheckCircle, HandHeart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axios from "../lib/axios";
import Confetti from "react-confetti";
import { toast } from "sonner";
import LoadingSpinner from "../components/LoadingSpinner";

const PurchaseSuccessPage = () => {
	const { clearCart } = useCartStore();
	const location = useLocation();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const isCod = location.state?.cod;
	const [orderId, setOrderId] = useState(location.state?.orderId || null);

	const { mutate: verifyPayment, isPending: isVerifying } = useMutation({
		mutationFn: (sessionId) => axios.post("/payments/verify-paymongo-payment", { sessionId }),
		onSuccess: (data) => {
			setOrderId(data.data.orderId);
			clearCart();
			toast.success("Payment verified and order placed successfully!");
		},
		onError: (error) => {
			toast.error(error.response?.data?.message || "Payment verification failed.");
			navigate("/checkout");
		},
	});

	useEffect(() => {
		const paymongoSessionId = searchParams.get("checkout_id");

		if (paymongoSessionId) {
			verifyPayment(paymongoSessionId);
		} else if (isCod) {
			clearCart();
			toast.success("Order placed successfully!");
		}
	}, [searchParams, isCod, clearCart, verifyPayment]);

	const { data: order, isLoading: isLoadingOrder } = useQuery({
		queryKey: ["order", orderId],
		queryFn: async () => {
			const res = await axios.get(`/orders/${orderId}`);
			return res.data;
		},
		enabled: !!orderId,
	});

	const getEstimatedDeliveryTime = (distance) => {
		if (distance === undefined) return "30-45 minutes";
		const prepTime = 15;
		const travelTime = Math.round(distance * 3);
		const totalTime = prepTime + travelTime;
		return `${totalTime}-${totalTime + 10} minutes`;
	};

	if (isVerifying || (searchParams.get("id") && !orderId)) {
		return (
			<div className='h-screen flex flex-col items-center justify-center'>
				<LoadingSpinner />
				<p className='mt-4 text-lg text-white'>Verifying your payment, please wait...</p>
			</div>
		);
	}

	if (isLoadingOrder) {
		return (
			<div className='h-screen flex flex-col items-center justify-center'>
				<LoadingSpinner />
				<p className='mt-4 text-lg text-white'>Loading order details...</p>
			</div>
		);
	}

	return (
		<div className='h-screen flex items-center justify-center px-4'>
			<Confetti
				width={window.innerWidth}
				height={window.innerHeight}
				gravity={0.1}
				style={{ zIndex: 99 }}
				numberOfPieces={700}
				recycle={false}
			/>

			<div className='max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10'>
				<div className='p-6 sm:p-8'>
					<div className='flex justify-center'>
						<CheckCircle className='text-emerald-400 w-16 h-16 mb-4' />
					</div>
					<h1 className='text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2'>
						{isCod ? "Order Placed Successfully!" : "Purchase Successful!"}
					</h1>

					<p className='text-gray-300 text-center mb-2'>
						{isCod ? "Your order is now being prepared." : "Thank you for your order. We're preparing it now."}
					</p>
					<p className='text-emerald-400 text-center text-sm mb-6'>
						Check your email for order details and updates.
					</p>
					{order && (
						<div className='bg-gray-700 rounded-lg p-4 mb-6'>
							<div className='flex items-center justify-between mb-2'>
								<span className='text-sm text-gray-400'>Order number</span>
								<span className='text-sm font-semibold text-emerald-400'>
									#{order?._id.substring(0, 8)}...
								</span>
							</div>
							<div className='flex items-center justify-between'>
								<span className='text-sm text-gray-400'>Estimated delivery</span>
								<span className='text-sm font-semibold text-emerald-400'>
									{getEstimatedDeliveryTime(order?.distance)}
								</span>
							</div>
						</div>
					)}

					<div className='space-y-4'>
						<button className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center'>
							<HandHeart className='mr-2' size={18} />
							Thanks for trusting us!
						</button>
						<Link
							to={"/"}
							className='w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 rounded-lg transition duration-300 flex items-center justify-center'
						>
							Continue Shopping
							<ArrowRight className='ml-2' size={18} />
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};
export default PurchaseSuccessPage;