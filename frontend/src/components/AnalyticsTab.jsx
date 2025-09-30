import { motion } from "framer-motion";
import { useState } from "react";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";
import LoadingSpinner from "./LoadingSpinner";

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
	<motion.div
		className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative ${color}`}
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.5 }}
	>
		<div className='flex justify-between items-center'>
			<div className='z-10'>
				<p className='text-emerald-300 text-sm mb-1 font-semibold'>{title}</p>
				<h3 className='text-white text-3xl font-bold'>{value}</h3>
			</div>
		</div>
		<div className='absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-30' />
		<div className='absolute -bottom-4 -right-4 text-emerald-800 opacity-50'>
			<Icon className='h-32 w-32' />
		</div>
	</motion.div>
);

const AnalyticsTab = () => {
	const [filter, setFilter] = useState("weekly");

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["revenueAnalytics", filter],
		queryFn: async () => {
			const res = await axios.get(`/analytics?filter=${filter}`);
			return res.data;
		},
		keepPreviousData: true,
	});

	if (isLoading) return <LoadingSpinner />;
	if (isError) return <div>Error: {error.message}</div>;

	const filters = ["daily", "weekly", "yearly", "overall"];

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
			<div className='flex justify-center mb-8'>
				<div className='flex items-center bg-gray-800/60 rounded-lg p-1'>
					{filters.map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f)}
							className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
								filter === f ? "bg-emerald-600 text-white" : "text-gray-300 hover:bg-gray-700"
							}`}
						>
							{f.charAt(0).toUpperCase() + f.slice(1)}
						</button>
					))}
				</div>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
				<AnalyticsCard
					title={`Total Revenue (${filter})`}
					value={`₱${data?.totalRevenue.toLocaleString("en-US", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`}
					icon={DollarSign}
					color='from-emerald-500 to-lime-700'
				/>
				<AnalyticsCard
					title='Total Users'
					value={data?.stats?.totalUsers.toLocaleString() ?? "0"}
					icon={Users}
					color='from-emerald-500 to-teal-700'
				/>
				<AnalyticsCard
					title='Total Products'
					value={data?.stats?.totalProducts.toLocaleString() ?? "0"}
					icon={Package}
					color='from-emerald-500 to-green-700'
				/>
				<AnalyticsCard
					title='Total Delivered Orders'
					value={data?.stats?.totalOrders.toLocaleString() ?? "0"}
					icon={ShoppingCart}
					color='from-emerald-500 to-cyan-700'
				/>
			</div>

			<motion.div
				className='bg-gray-800/60 rounded-lg p-6 shadow-lg'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.25 }}
			>
				<h3 className='text-xl font-bold text-white mb-4'>Revenue Breakdown</h3>
				<ResponsiveContainer width='100%' height={400}>
					<BarChart data={data?.graphData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#4A5568' />
						<XAxis dataKey='name' stroke='#A0AEC0' tick={{ fontSize: 12 }} />
						<YAxis stroke='#A0AEC0' tick={{ fontSize: 12 }} />
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4A5568",
								color: "#E5E7EB",
							}}
							formatter={(value) => `₱${value.toLocaleString()}`}
						/>
						<Legend wrapperStyle={{ color: "#E5E7EB" }} />
						<Bar dataKey='revenue' fill='#10B981' name='Revenue' />
					</BarChart>
				</ResponsiveContainer>
			</motion.div>
		</div>
	);
};
export default AnalyticsTab;