import React from 'react';
import { FiLogOut, FiUser, FiBell } from 'react-icons/fi';

const DriverNavbar = () => {
  return (
    <nav className="bg-white shadow-md w-full z-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <img src="/logo.png" alt="KalyeKart Logo" className="h-10 w-auto" />
            <h1 className="text-xl font-bold text-gray-800 ml-3">Driver Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative text-gray-600 hover:text-emerald-500">
              <FiBell size={24} />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="text-gray-600 hover:text-emerald-500">
              <FiUser size={24} />
            </button>
            <button className="flex items-center text-gray-600 hover:text-red-500">
              <FiLogOut size={24} />
              <span className="ml-2 hidden md:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DriverNavbar;