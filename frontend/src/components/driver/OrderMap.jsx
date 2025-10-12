import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { FiNavigation, FiCheckCircle, FiPackage } from 'react-icons/fi';

// Fix for default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const ActionButton = ({ icon, text, status, currentStatus }) => {
    const isVisible = () => {
        if (status === 'Pending') return text === 'Accept Order';
        if (status === 'Accepted') return text === 'Confirm Pickup';
        if (status === 'Out for Delivery') return text === 'Confirm Delivery';
        return false;
    };

    if (!isVisible()) return null;

    return (
        <button className="flex-1 bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-all duration-200 flex items-center justify-center">
            {icon}
            <span className="ml-2">{text}</span>
        </button>
    );
};


const OrderMap = ({ selectedOrder }) => {
  if (!selectedOrder) {
    return (
      <div className="w-full md:w-2/3 p-4 flex items-center justify-center bg-gray-200">
        <p className="text-gray-500">Select an order to see the details</p>
      </div>
    );
  }

  const { pickupCoordinates, deliveryCoordinates, restaurantName, customerName, status } = selectedOrder;
  const position = deliveryCoordinates || pickupCoordinates;
  const polyline = [pickupCoordinates, deliveryCoordinates];

  return (
    <div className="w-full md:w-2/3 h-screen flex flex-col">
      <div className="flex-grow">
        <MapContainer center={position} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={pickupCoordinates}>
            <Popup>Pickup: {restaurantName}</Popup>
          </Marker>
          <Marker position={deliveryCoordinates}>
            <Popup>Delivery for {customerName}</Popup>
          </Marker>
          <Polyline positions={polyline} color="#059669" weight={5} />
        </MapContainer>
      </div>
      <div className="bg-white p-4 border-t border-gray-200 shadow-md">
        <h3 className="text-xl font-bold mb-2 text-gray-800">Next Step</h3>
         <div className="flex space-x-2">
            <ActionButton icon={<FiNavigation/>} text="Accept Order" status={status} />
            <ActionButton icon={<FiPackage/>} text="Confirm Pickup" status={status} />
            <ActionButton icon={<FiCheckCircle/>} text="Confirm Delivery" status={status} />
        </div>
      </div>
    </div>
  );
};

export default OrderMap;