import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, Package, ShoppingCart, DollarSign, LineChart as LineChartIcon, BarChart as BarChartIcon } from "lucide-react";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import LoadingSpinner from "./LoadingSpinner";

const AnalyticsCard = ({ title, value, icon: Icon }) => (
	<motion.div
		className='bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative'
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.5 }}
	>
		<div className='flex justify-between items-center z-10 relative'>
			<div>
				<p className='text-emerald-300 text-sm mb-1 font-semibold'>{title}</p>
				<h3 className='text-white text-3xl font-bold'>{value}</h3>
			</div>
			<Icon className='h-8 w-8 text-emerald-400' />
		</div>
		<div className='absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-50' />
	</motion.div>
);

// Custom tooltip for better readability and styling
const CustomTooltip = ({ active, payload, label }) => {
	if (active && payload && payload.length) {
		return (
			<div className='bg-gray-700/80 backdrop-blur-sm p-3 rounded-lg border border-gray-600 shadow-lg'>
				<p className='text-emerald-300 font-semibold'>{`Time: ${label}`}</p>
				{payload.map((pld, index) => (
					<p key={index} style={{ color: pld.color }}>
						{`${pld.name}: ${
							pld.dataKey === "revenue"
								? `₱${pld.value.toLocaleString("en-US", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
								  })}`
								: pld.value.toLocaleString()
						}`}
					</p>
				))}
			</div>
		);
	}
	return null;
};

const AnalyticsTab = () => {
	const [analyticsData, setAnalyticsData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [filter, setFilter] = useState("weekly");
	const [chartKey, setChartKey] = useState(0);

	useEffect(() => {
		setIsLoading(true);
		const eventSource = new EventSource(`/api/analytics/stream?filter=${filter}`, { withCredentials: true });

		eventSource.onmessage = (event) => {
			const data = JSON.parse(event.data);
			setAnalyticsData(data);
			setChartKey((prevKey) => prevKey + 1); // Force re-render of charts
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

	if (isLoading && !analyticsData) {
		return <LoadingSpinner fullScreen={true} />;
	}

	const filters = ["daily", "weekly", "monthly", "yearly", "overall"];
	const revenue = analyticsData?.totalRevenue ?? 0;
	const sales = analyticsData?.totalSales ?? 0;

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
					value={`₱${revenue.toLocaleString("en-US", {
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					})}`}
					icon={DollarSign}
				/>
				<AnalyticsCard title={`Total Sales (${filter})`} value={sales.toLocaleString()} icon={ShoppingCart} />
				<AnalyticsCard title='Total Users' value={analyticsData?.stats?.totalUsers.toLocaleString() ?? "0"} icon={Users} />
				<AnalyticsCard
					title='Total Products'
					value={analyticsData?.stats?.totalProducts.toLocaleString() ?? "0"}
					icon={Package}
				/>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
				{/* Revenue Chart */}
				<motion.div
					className='bg-gray-800/60 rounded-lg p-6 shadow-lg'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<h3 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
						<LineChartIcon className='h-6 w-6 text-emerald-400' />
						Revenue Trend
					</h3>
					<ResponsiveContainer width='100%' height={400}>
						<LineChart key={chartKey} data={analyticsData?.graphData}>
							<CartesianGrid strokeDasharray='3 3' stroke='#4A5568' />
							<XAxis dataKey='name' stroke='#A0AEC0' tick={{ fontSize: 12 }} />
							<YAxis stroke='#82ca9d' tick={{ fontSize: 12 }} />
							<Tooltip content={<CustomTooltip />} />
							<Legend wrapperStyle={{ color: "#E5E7EB" }} />
							<Line
								type='monotone'
								dataKey='revenue'
								stroke='#82ca9d'
								strokeWidth={2}
								activeDot={{ r: 8 }}
								name='Revenue (₱)'
							/>
						</LineChart>
					</ResponsiveContainer>
				</motion.div>

				{/* Sales Chart */}
				<motion.div
					className='bg-gray-800/60 rounded-lg p-6 shadow-lg'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.35 }}
				>
					<h3 className='text-xl font-bold text-white mb-4 flex items-center gap-2'>
						<BarChartIcon className='h-6 w-6 text-indigo-400' />
						Sales Volume
					</h3>
					<ResponsiveContainer width='100%' height={400}>
						<BarChart key={chartKey} data={analyticsData?.graphData}>
							<CartesianGrid strokeDasharray='3 3' stroke='#4A5568' />
							<XAxis dataKey='name' stroke='#A0AEC0' tick={{ fontSize: 12 }} />
							<YAxis stroke='#8884d8' tick={{ fontSize: 12 }} />
							<Tooltip content={<CustomTooltip />} />
							<Legend wrapperStyle={{ color: "#E5E7EB" }} />
							<Bar dataKey='sales' fill='#8884d8' name='Sales (Units)' />
						</BarChart>
					</ResponsiveContainer>
				</motion.div>
			</div>
		</div>
	);
};
export default AnalyticsTab;