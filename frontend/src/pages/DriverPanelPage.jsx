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
    setSelectedOrder(firstPending || orders[0] || null);
  }, [orders]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === orderId) {
        return { ...order, status: newStatus };
      }
      return order;
    });
    setOrders(updatedOrders);

    // Also update the selected order if it's the one being changed
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
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
        <OrderMap
          selectedOrder={selectedOrder}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      </div>
    </div>
  );
};

export default DriverPanelPage;