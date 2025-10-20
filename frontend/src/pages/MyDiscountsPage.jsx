import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "sonner";
import { motion } from "framer-motion";

const MyDiscountsPage = () => {
	const { data: discounts, isLoading } = useQuery({
		queryKey: ["myDiscounts"],
		queryFn: () => axios.get("/discounts/my-discounts").then((res) => res.data),
		onError: (error) => {
			toast.error(error.response.data.message);
		},
	});

	return (
		<main className='container my-10'>
			<motion.div
				className='max-w-4xl mx-auto'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<h1 className='text-3xl font-extrabold text-emerald-400 mb-8 text-center'>My Discounts</h1>
				{isLoading ? (
					<LoadingSpinner />
				) : Array.isArray(discounts) ? (
					<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
						{discounts.map((discount) => (
							<div key={discount._id} className='bg-gray-800 p-6 rounded-lg shadow-lg'>
								<h2 className='text-xl font-bold text-white'>{discount.title}</h2>
								<p className='text-gray-400'>{discount.description}</p>
								<div className='mt-4'>
									<p className='text-sm text-gray-300'>
										<span className='font-semibold'>Code:</span> {discount.code}
									</p>
									<p className='text-sm text-gray-300'>
										<span className='font-semibold'>Expires:</span>{" "}
										{new Date(discount.validUntil).toLocaleDateString()}
									</p>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className='text-center text-gray-400'>Could not load your discounts at this time.</p>
				)}
			</motion.div>
		</main>
	);
};

export default MyDiscountsPage;
