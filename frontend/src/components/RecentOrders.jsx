import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import LoadingSpinner from "./LoadingSpinner";
import { ShoppingBag, ChevronRight } from "lucide-react";

const RecentOrders = () => {
	const {
		data: orders,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["myOrders"],
		queryFn: () => axios.get("/orders").then((res) => res.data),
	});

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (isError) {
		return <p className='text-red-400'>Failed to load recent orders.</p>;
	}

	return (
		<div className='bg-gray-800 p-6 rounded-lg'>
			<h2 className='text-xl font-semibold mb-4 flex items-center'>
				<ShoppingBag className='mr-2' /> Recent Orders
			</h2>
			{orders && orders.length > 0 ? (
				<div className='space-y-4'>
					{orders.slice(0, 5).map((order) => (
						<Link
							to={`/my-orders/${order._id}`}
							key={order._id}
							className='block bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors'
						>
							<div className='flex justify-between items-center'>
								<div>
									<p className='font-bold text-white'>Order #{order._id.slice(-6)}</p>
									<p className='text-sm text-gray-400'>
										{format(new Date(order.createdAt), "PPP")}
									</p>
								</div>
								<div className='text-right'>
									<p className='font-semibold text-white'>
										₱{order.totalAmount.toFixed(2)}
									</p>
									<span
										className={`px-2 py-1 text-xs font-semibold rounded-full ${
											order.status === "Delivered"
												? "bg-green-500 text-white"
												: "bg-yellow-500 text-black"
										}`}
									>
										{order.status}
									</span>
								</div>
								<ChevronRight className='text-gray-500' />
							</div>
						</Link>
					))}
                    {orders.length > 5 && (
                         <Link to="/my-orders" className="text-emerald-400 hover:text-emerald-300 font-semibold mt-4 block text-center">
                            View All Orders
                        </Link>
                    )}
				</div>
			) : (
				<p className='text-gray-400'>You have no recent orders.</p>
			)}
		</div>
	);
};

export default RecentOrders;