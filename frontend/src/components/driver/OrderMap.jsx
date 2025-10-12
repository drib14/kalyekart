import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiNavigation, FiCheckCircle, FiPackage } from 'react-icons/fi';

// Fix for default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom motorcycle icon
const motorcycleIcon = new L.Icon({
    iconUrl: 'https://i.imgur.com/k2oM03h.png',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

const ActionButton = ({ icon, text, onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex-1 bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-all duration-200 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            {icon}
            <span className="ml-2">{text}</span>
        </button>
    );
};

// Animated marker for the driver
const DriverMarker = ({ start, end }) => {
    const markerRef = useRef(null);
    const [position, setPosition] = useState(start);
    const map = useMap();

    useEffect(() => {
        let t = 0;
        const interval = setInterval(() => {
            if (t > 1) {
                clearInterval(interval);
                return;
            }
            const newPos = [
                start[0] + (end[0] - start[0]) * t,
                start[1] + (end[1] - start[1]) * t
            ];
            setPosition(newPos);
            if (markerRef.current) {
                markerRef.current.setLatLng(newPos);
            }
            map.panTo(newPos, { animate: true, duration: 0.1 });
            t += 0.005; // Adjust speed of animation
        }, 100); // Adjust update frequency

        return () => clearInterval(interval);
    }, [start, end, map]);

    return <Marker ref={markerRef} position={position} icon={motorcycleIcon} />;
};


const OrderMap = ({ selectedOrder, onUpdateStatus }) => {
  if (!selectedOrder) {
    return (
      <div className="w-full md:w-2/3 p-4 flex items-center justify-center bg-gray-200">
        <p className="text-gray-500">Select an order to see the details</p>
      </div>
    );
  }

  const { id, pickupCoordinates, deliveryCoordinates, restaurantName, customerName, status } = selectedOrder;
  const position = deliveryCoordinates || pickupCoordinates;
  const polyline = [pickupCoordinates, deliveryCoordinates];

  const handleAction = (newStatus) => {
    onUpdateStatus(id, newStatus);
  };

  return (
    <div className="w-full md:w-2/3 h-screen flex flex-col">
      <div className="flex-grow">
        <MapContainer key={id} center={position} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
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
          {status === 'Out for Delivery' && <DriverMarker start={pickupCoordinates} end={deliveryCoordinates} />}
        </MapContainer>
      </div>
      <div className="bg-white p-4 border-t border-gray-200 shadow-md">
        <h3 className="text-xl font-bold mb-2 text-gray-800">Next Step</h3>
         <div className="flex space-x-2">
            <ActionButton
                icon={<FiNavigation/>}
                text="Accept Order"
                onClick={() => handleAction('Accepted')}
                disabled={status !== 'Pending'}
            />
            <ActionButton
                icon={<FiPackage/>}
                text="Confirm Pickup"
                onClick={() => handleAction('Out for Delivery')}
                disabled={status !== 'Accepted'}
            />
            <ActionButton
                icon={<FiCheckCircle/>}
                text="Confirm Delivery"
                onClick={() => handleAction('Delivered')}
                disabled={status !== 'Out for Delivery'}
            />
        </div>
      </div>
    </div>
  );
};

export default OrderMap;