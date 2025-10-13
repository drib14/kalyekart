import React from 'react';
import { FiLogOut, FiUser, FiBell, FiList } from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

const NavLink = ({ to, icon, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    return (
        <Link
            to={to}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isActive
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 hover:bg-emerald-100 hover:text-emerald-600'
            }`}
        >
            {icon}
            <span className="ml-3">{children}</span>
        </Link>
    );
};

const DriverNavbar = () => {
  return (
    <nav className="bg-white shadow-md w-full z-20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center">
            <Link to="/driver/panel">
                <img src="/logo.png" alt="KalyeKart Logo" className="h-10 w-auto" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800 ml-3 hidden sm:block">Driver Dashboard</h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:flex items-center space-x-2">
                <NavLink to="/driver/panel" icon={<FiList size={20} />}>Dashboard</NavLink>
                <NavLink to="/driver/history" icon={<FiList size={20} />}>History</NavLink>
            </div>
            <button className="relative text-gray-600 hover:text-emerald-500 p-2 rounded-full hover:bg-gray-100">
              <FiBell size={24} />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
             <Link to="/driver/profile" className="text-gray-600 hover:text-emerald-500 p-2 rounded-full hover:bg-gray-100">
              <FiUser size={24} />
            </Link>
            <button className="flex items-center text-gray-600 hover:text-red-500 p-2 rounded-full hover:bg-gray-100">
              <FiLogOut size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DriverNavbar;