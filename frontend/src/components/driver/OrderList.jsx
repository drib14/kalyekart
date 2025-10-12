import React from 'react';
import { FiMapPin, FiCreditCard, FiDollarSign, FiBox } from 'react-icons/fi';

const statusStyles = {
  Pending: 'bg-orange-200 text-orange-800',
  Accepted: 'bg-blue-200 text-blue-800',
  'Out for Delivery': 'bg-yellow-200 text-yellow-800',
  Delivered: 'bg-green-200 text-green-800',
};

const OrderList = ({ orders, onSelectOrder, selectedOrder }) => {
  return (
    <div className="w-full md:w-1/3 p-4 bg-gray-50 h-screen overflow-y-auto border-r border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">New Opportunities</h2>
      {orders.map((order) => (
        <div
          key={order.id}
          className={`p-4 rounded-lg shadow mb-4 cursor-pointer transition-all duration-200 ${
            selectedOrder && selectedOrder.id === order.id
              ? 'bg-emerald-100 border-l-4 border-emerald-500'
              : 'bg-white hover:bg-gray-100'
          }`}
          onClick={() => onSelectOrder(order)}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg text-gray-900">{order.id}</h3>
            <span
              className={`px-3 py-1 text-sm font-semibold rounded-full ${
                statusStyles[order.status] || 'bg-gray-200 text-gray-800'
              }`}
            >
              {order.status}
            </span>
          </div>
          <div className="space-y-2 text-gray-700">
            <div className="flex items-center">
              <FiBox className="mr-2 text-emerald-500" />
              <p>
                <span className="font-semibold">From:</span> {order.restaurantName}
              </p>
            </div>
            <div className="flex items-center">
              <FiMapPin className="mr-2 text-red-500" />
              <p>
                <span className="font-semibold">To:</span> {order.deliveryAddress}
              </p>
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center">
                {order.paymentMethod === 'Cash on Delivery' ? (
                  <FiDollarSign className="mr-2 text-green-600" />
                ) : (
                  <FiCreditCard className="mr-2 text-blue-500" />
                )}
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <p className="text-lg font-bold text-gray-900">
                ₱{order.total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderList;