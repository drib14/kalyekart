import { useState } from "react";
import { useCartStore } from "../stores/useCartStore";
import { toast } from "sonner";

const DiscountCodeInput = ({ deliveryFee }) => {
	const { applyDiscount, removeDiscount, appliedDiscount } = useCartStore();
	const [code, setCode] = useState("");

	const handleApplyDiscount = () => {
		if (!code) {
			toast.error("Please enter a discount code.");
			return;
		}
		applyDiscount(code, deliveryFee);
		setCode("");
	};

	const handleRemoveDiscount = () => {
		removeDiscount();
	};

	return (
		<div className='mt-6'>
			<h3 className='text-lg font-medium text-white mb-2'>Promo Code</h3>
			<div className='flex gap-2'>
				<input
					type='text'
					value={code}
					onChange={(e) => setCode(e.target.value.toUpperCase())}
					placeholder='Enter promo code'
					className='w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg'
					disabled={!!appliedDiscount}
				/>
				{appliedDiscount ? (
					<button
						onClick={handleRemoveDiscount}
						className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700'
					>
						Remove
					</button>
				) : (
					<button
						onClick={handleApplyDiscount}
						className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700'
					>
						Apply
					</button>
				)}
			</div>
		</div>
	);
};

export default DiscountCodeInput;
