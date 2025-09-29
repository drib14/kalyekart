import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, Package, ShoppingCart, DollarSign, XCircle, Undo2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AnalyticsTab = () => {
	const [analyticsData, setAnalyticsData] = useState({
		users: 0,
		products: 0,
		totalSales: 0,
		totalRevenue: 0,
		cancelledOrders: 0,
		refundedOrders: 0,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [dailySalesData, setDailySalesData] = useState([]);
	const [filter, setFilter] = useState("weekly");
	const [chartKey, setChartKey] = useState(0); // Key to force chart re-render

	useEffect(() => {
		setIsLoading(true);
		const eventSource = new EventSource(`/api/analytics/stream?filter=${filter}`);

		eventSource.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setAnalyticsData(data.analyticsData);
			setDailySalesData(data.dailySalesData);
			setChartKey(prevKey => prevKey + 1); // Update key to force re-render
			setIsLoading(false);
		};

		eventSource.onerror = (error) => {
			console.error("EventSource failed:", error);
			eventSource.close();
			setIsLoading(false);
		};

		return () => {
			eventSource.close();
		};
	}, [filter]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	const filters = ["overall", "daily", "weekly", "yearly"];

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8'>
				<AnalyticsCard
					title='Total Users'
					value={analyticsData.users.toLocaleString()}
					icon={Users}
					color='from-emerald-500 to-teal-700'
				/>
				<AnalyticsCard
					title='Total Products'
					value={analyticsData.products.toLocaleString()}
					icon={Package}
					color='from-emerald-500 to-green-700'
				/>
				<AnalyticsCard
					title='Total Sales'
					value={analyticsData.totalSales.toLocaleString()}
					icon={ShoppingCart}
					color='from-emerald-500 to-cyan-700'
				/>
				<AnalyticsCard
					title='Total Revenue'
					value={`₱${analyticsData.totalRevenue.toLocaleString()}`}
					icon={DollarSign}
					color='from-emerald-500 to-lime-700'
				/>
				<AnalyticsCard
					title='Cancelled Orders'
					value={analyticsData.cancelledOrders.toLocaleString()}
					icon={XCircle}
					color='from-red-500 to-orange-700'
				/>
				<AnalyticsCard
					title='Refunded Orders'
					value={analyticsData.refundedOrders.toLocaleString()}
					icon={Undo2}
					color='from-purple-500 to-indigo-700'
				/>
			</div>

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

			<motion.div
				className='bg-gray-800/60 rounded-lg p-6 shadow-lg'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.25 }}
			>
				<ResponsiveContainer width='100%' height={400}>
					<LineChart key={chartKey} data={dailySalesData}>
						<CartesianGrid strokeDasharray='3 3' stroke='#4A5568' />
						<XAxis dataKey='date' stroke='#A0AEC0' tick={{ fontSize: 12 }} />
						<YAxis yAxisId='left' stroke='#A0AEC0' tick={{ fontSize: 12 }} />
						<YAxis yAxisId='right' orientation='right' stroke='#A0AEC0' tick={{ fontSize: 12 }} />
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(31, 41, 55, 0.8)",
								borderColor: "#4A5568",
								color: "#E5E7EB",
							}}
						/>
						<Legend wrapperStyle={{ color: "#E5E7EB" }} />
						<Line
							yAxisId='left'
							type='monotone'
							dataKey='sales'
							stroke='#10B981'
							strokeWidth={2}
							activeDot={{ r: 8 }}
							name='Sales'
						/>
						<Line
							yAxisId='right'
							type='monotone'
							dataKey='revenue'
							stroke='#3B82F6'
							strokeWidth={2}
							activeDot={{ r: 8 }}
							name='Revenue'
						/>
					</LineChart>
				</ResponsiveContainer>
			</motion.div>
		</div>
	);
};
export default AnalyticsTab;

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