import React from 'react';
import DriverNavbar from '../components/driver/DriverNavbar';
import { mockOrders } from '../data/mockDriverData';
import { FiCheckCircle } from 'react-icons/fi';

const DriverOrderHistory = () => {
  const completedOrders = mockOrders.filter(order => order.status === 'Delivered');

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <DriverNavbar />
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Order History</h1>
        <div className="bg-white rounded-lg shadow">
          <ul className="divide-y divide-gray-200">
            {completedOrders.length > 0 ? (
              completedOrders.map((order) => (
                <li key={order.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-600">
                      Delivered to {order.customerName} from {order.restaurantName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-emerald-600">
                      ₱{order.total.toFixed(2)}
                    </p>
                    <div className="flex items-center justify-end text-green-500 mt-1">
                      <FiCheckCircle className="mr-1" />
                      <span className="text-sm font-semibold">Completed</span>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="p-4 text-center text-gray-500">
                No completed orders yet.
              </li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default DriverOrderHistory;