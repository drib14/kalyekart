import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";

const StatCard = ({ icon, label, value, color }) => (
	<div className={`bg-gray-800 p-6 rounded-lg flex items-center space-x-4 border-l-4 ${color}`}>
		<div className='text-white'>{icon}</div>
		<div>
			<p className='text-gray-400 text-sm'>{label}</p>
			<p className='text-2xl font-bold text-white'>{value}</p>
		</div>
	</div>
);

const QuickStats = () => {
	const {
		data: stats,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["quickStats"],
		queryFn: () => axios.get("/analytics/quick-stats").then((res) => res.data),
	});

	if (isLoading) {
		return (
			<div className='flex justify-center p-8'>
				<LoadingSpinner />
			</div>
		);
	}

	if (isError || !stats) {
		return (
			<div className='mb-8 text-center text-red-400'>
				<p>Could not load quick stats.</p>
			</div>
		);
	}

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-PH", {
			style: "currency",
			currency: "PHP",
		}).format(amount);
	};

	return (
		<div className='mb-8'>
			<h2 className='text-2xl font-bold text-white mb-4'>Quick Stats</h2>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
				<StatCard
					icon={<DollarSign size={32} />}
					label='Total Revenue'
					value={formatCurrency(stats.totalRevenue)}
					color='border-emerald-500'
				/>
				<StatCard
					icon={<ShoppingCart size={32} />}
					label='Total Sales'
					value={stats.totalSales}
					color='border-blue-500'
				/>
				<StatCard
					icon={<Users size={32} />}
					label='Total Customers'
					value={stats.totalUsers}
					color='border-purple-500'
				/>
				<StatCard
					icon={<Package size={32} />}
					label='Total Products'
					value={stats.totalProducts}
					color='border-yellow-500'
				/>
			</div>
		</div>
	);
};

export default QuickStats;