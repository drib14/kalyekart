import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../lib/axios";
import { toast } from "sonner";
import { Award, Clock, ArrowRight } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useUserStore } from "../stores/useUserStore";
import { motion } from "framer-motion";

const MyRewardsPage = () => {
	const { user } = useUserStore();
	const queryClient = useQueryClient();

	const { data: userData, isLoading: isLoadingPoints } = useQuery({
		queryKey: ["userPoints"],
		queryFn: () => axios.get("/rewards/points").then((res) => res.data),
	});

	const { data: rewards, isLoading: isLoadingRewards } = useQuery({
		queryKey: ["rewards"],
		queryFn: () => axios.get("/rewards").then((res) => res.data),
	});

	const { mutate: redeemReward, isPending: isRedeeming } = useMutation({
		mutationFn: (rewardId) => axios.post(`/rewards/redeem/${rewardId}`),
		onSuccess: (data) => {
			queryClient.invalidateQueries(["userPoints"]);
			toast.success(
				<div>
					Reward redeemed! <br />
					Code: <span className='font-bold text-emerald-400'>{data.data.code}</span>
				</div>,
				{ duration: 5000 }
			);
		},
		onError: (error) => toast.error(error.response?.data?.message || "Failed to redeem reward"),
	});

	if (isLoadingPoints || isLoadingRewards) return <LoadingSpinner />;

	const points = userData?.loyaltyPoints || 0;
	const history = userData?.pointsHistory || [];

	return (
		<div className='container mx-auto px-4 py-8 max-w-4xl'>
			{/* Header / Points Banner */}
			<div className='bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 mb-10 text-white shadow-lg relative overflow-hidden'>
				<div className='absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10'>
					<Award size={200} />
				</div>
				<div className='relative z-10'>
					<h2 className='text-xl font-medium mb-2'>Available Points</h2>
					<div className='text-6xl font-bold mb-4'>{points.toLocaleString()}</div>
					<p className='text-emerald-100'>Earn more points with every order!</p>
				</div>
			</div>

			<h2 className='text-2xl font-bold text-white mb-6 flex items-center'>
				<GiftIcon className='mr-2 text-emerald-400' /> Redeem Rewards
			</h2>

			<div className='grid gap-6 md:grid-cols-2 mb-12'>
				{rewards?.map((reward) => (
					<motion.div
						whileHover={{ y: -5 }}
						key={reward._id}
						className={`bg-gray-800 p-6 rounded-xl border ${
							points >= reward.cost ? "border-emerald-500/50" : "border-gray-700"
						} shadow-lg flex flex-col justify-between`}
					>
						<div>
							<div className='flex justify-between items-start mb-4'>
								<h3 className='text-xl font-bold text-white'>{reward.name}</h3>
								<span className='bg-gray-900 text-emerald-400 px-3 py-1 rounded-full font-bold text-sm'>
									{reward.cost} pts
								</span>
							</div>
							<p className='text-gray-400 mb-6'>{reward.description}</p>
						</div>
						<button
							onClick={() => redeemReward(reward._id)}
							disabled={points < reward.cost || isRedeeming}
							className={`w-full py-3 rounded-lg font-medium transition-all ${
								points >= reward.cost
									? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-emerald-500/25"
									: "bg-gray-700 text-gray-500 cursor-not-allowed"
							}`}
						>
							{isRedeeming ? "Processing..." : points >= reward.cost ? "Redeem Reward" : "Insufficient Points"}
						</button>
					</motion.div>
				))}
			</div>

			<h2 className='text-2xl font-bold text-white mb-6 flex items-center'>
				<Clock className='mr-2 text-gray-400' /> Points History
			</h2>

			<div className='bg-gray-800 rounded-xl overflow-hidden border border-gray-700'>
				{history.length > 0 ? (
					<div className='divide-y divide-gray-700'>
						{history.map((entry) => (
							<div key={entry._id} className='p-4 flex items-center justify-between hover:bg-gray-750 transition-colors'>
								<div className='flex items-center'>
									<div
										className={`p-2 rounded-full mr-4 ${
											entry.type === "earned" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
										}`}
									>
										{entry.type === "earned" ? <ArrowRight className='rotate-45' /> : <ArrowRight className='-rotate-45' />}
									</div>
									<div>
										<p className='text-white font-medium'>{entry.description}</p>
										<p className='text-sm text-gray-500'>{new Date(entry.date).toLocaleDateString()}</p>
									</div>
								</div>
								<span
									className={`font-bold ${
										entry.type === "earned" ? "text-emerald-400" : "text-red-400"
									}`}
								>
									{entry.type === "earned" ? "+" : "-"}{entry.amount}
								</span>
							</div>
						)).reverse()}
					</div>
				) : (
					<div className='p-8 text-center text-gray-500'>No points history yet.</div>
				)}
			</div>
		</div>
	);
};

// Helper Icon
const GiftIcon = ({ className }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		className={className}
	>
		<polyline points='20 12 20 22 4 22 4 12' />
		<rect x='2' y='7' width='20' height='5' />
		<line x1='12' y1='22' x2='12' y2='7' />
		<path d='M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z' />
		<path d='M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z' />
	</svg>
);

export default MyRewardsPage;
