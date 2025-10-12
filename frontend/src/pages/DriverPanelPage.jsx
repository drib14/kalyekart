import React, { useState, useEffect } from 'react';
import DriverNavbar from '../components/driver/DriverNavbar';
import OrderList from '../components/driver/OrderList';
import OrderMap from '../components/driver/OrderMap';
import { mockOrders } from '../data/mockDriverData';

const DriverPanelPage = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Set the first pending order as selected by default
  useEffect(() => {
    const firstPending = orders.find(o => o.status === 'Pending');
    setSelectedOrder(firstPending || orders[0]);
  }, [orders]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <DriverNavbar />
      <div className="flex flex-1 overflow-hidden">
        <OrderList
          orders={orders}
          onSelectOrder={handleSelectOrder}
          selectedOrder={selectedOrder}
        />
        <OrderMap selectedOrder={selectedOrder} />
      </div>
    </div>
  );
};

export default DriverPanelPage;