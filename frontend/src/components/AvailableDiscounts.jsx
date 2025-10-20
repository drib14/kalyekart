import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { useCartStore } from "../stores/useCartStore";

const AvailableDiscounts = ({ deliveryFee }) => {
	const { applyDiscount } = useCartStore();
	const { data: discounts, isLoading } = useQuery({
		queryKey: ["discounts"],
		queryFn: () => axios.get("/discounts/my-discounts").then((res) => res.data),
	});

	if (isLoading) {
		return <p className='text-sm text-gray-400'>Loading available discounts...</p>;
	}

	if (!discounts || discounts.length === 0) {
		return null;
	}

	const handleApplyDiscount = (code) => {
		applyDiscount(code, deliveryFee);
	};

	return (
		<div className='mt-6'>
			<h3 className='text-lg font-medium text-white mb-2'>Available Discounts</h3>
			<div className='space-y-2'>
				{discounts.map((discount) => (
					<div
						key={discount._id}
						className='bg-gray-700 p-3 rounded-lg flex justify-between items-center'
					>
						<div>
							<p className='font-semibold text-emerald-400'>{discount.title}</p>
							<p className='text-sm text-gray-300'>{discount.description}</p>
						</div>
						<button
							onClick={() => handleApplyDiscount(discount.code)}
							className='px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm'
						>
							Apply
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default AvailableDiscounts;
