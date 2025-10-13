import React from 'react';
import DriverNavbar from '../components/driver/DriverNavbar';
import { FiUser, FiMail, FiPhone, FiTruck } from 'react-icons/fi';

const DriverProfilePage = () => {
  // Mock driver data
  const driver = {
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@kalyekart.com',
    phone: '+63 917 123 4567',
    vehicle: 'Honda Click 125i',
    plateNumber: 'AB 12345'
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <DriverNavbar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
        <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-white text-4xl font-bold">
              {driver.name.charAt(0)}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{driver.name}</h2>
              <p className="text-gray-600">KalyeKart Delivery Partner</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center text-lg">
              <FiMail className="mr-4 text-gray-500" />
              <span className="text-gray-800">{driver.email}</span>
            </div>
            <div className="flex items-center text-lg">
              <FiPhone className="mr-4 text-gray-500" />
              <span className="text-gray-800">{driver.phone}</span>
            </div>
            <div className="border-t my-6"></div>
            <div className="flex items-center text-lg">
              <FiTruck className="mr-4 text-gray-500" />
              <span className="text-gray-800">{driver.vehicle} ({driver.plateNumber})</span>
            </div>
          </div>

          <div className="mt-8 text-right">
            <button className="bg-emerald-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-emerald-600 transition-colors">
              Edit Profile
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverProfilePage;