import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";
import LoadingSpinner from "./LoadingSpinner";
import { Link } from "react-router-dom";

const RecentOrders = () => {
	const { user } = useUserStore();
	const {
		data: orders,
		isLoading,
		isError,
		error,
	} = useQuery({
		queryKey: ["orders", user?._id],
		queryFn: async () => {
			const res = await axios.get("/orders");
			// Sort by date and take the 3 most recent
			return res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
		},
		enabled: !!user,
	});

	if (isLoading) {
		return <LoadingSpinner />;
	}

	if (isError) {
		return <p className='text-red-500'>Error fetching recent orders: {error.message}</p>;
	}

	return (
		<div className='mt-12'>
			<h2 className='text-2xl font-bold text-white mb-6'>Recent Orders</h2>
			{orders && orders.length > 0 ? (
				<div className='space-y-8'>
					{orders.map((order) => (
						<div key={order._id} className='bg-gray-800 p-6 rounded-lg shadow-lg'>
							<div className='flex justify-between items-start mb-4'>
								<div>
									<p className='text-lg font-bold text-emerald-400'>
										Order #{order._id.substring(0, 8)}...
									</p>
									<p className='text-sm text-gray-400'>
										Ordered on: {new Date(order.createdAt).toLocaleDateString()}
									</p>
								</div>
								<Link
									to={`/order/${order._id}`}
									className='text-sm text-emerald-400 hover:underline'
								>
									View Details
								</Link>
							</div>

							{/* Product Images */}
							<div className='flex flex-wrap gap-4 mb-4'>
								{order.products.map((item) =>
									item.product ? (
										<img
											key={item.product._id}
											src={item.product.image}
											alt={item.product.name}
											className='w-16 h-16 object-cover rounded-md border-2 border-gray-700'
											title={item.product.name}
										/>
									) : null
								)}
							</div>

							{/* Pricing Details */}
							<div className='border-t border-gray-700 pt-4'>
								<dl className='space-y-2 text-sm'>
									<div className='flex justify-between'>
										<dt className='text-gray-400'>Subtotal</dt>
										<dd className='text-white font-medium'>₱{(order.subtotal || 0).toFixed(2)}</dd>
									</div>
									<div className='flex justify-between'>
										<dt className='text-gray-400'>Delivery Fee</dt>
										<dd className='text-white font-medium'>₱{(order.deliveryFee || 0).toFixed(2)}</dd>
									</div>
									<div className='flex justify-between text-base font-bold'>
										<dt className='text-emerald-400'>Total</dt>
										<dd className='text-emerald-400'>₱{(order.totalAmount || 0).toFixed(2)}</dd>
									</div>
								</dl>
							</div>
						</div>
					))}
				</div>
			) : (
				<p className='text-gray-400'>You have no recent orders.</p>
			)}
		</div>
	);
};

export default RecentOrders;