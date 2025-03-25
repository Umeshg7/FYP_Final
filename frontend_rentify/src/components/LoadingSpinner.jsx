import React from 'react';
import { FaCar, FaCamera, FaBicycle, FaTshirt, FaHome, FaTools } from 'react-icons/fa';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-center">
        <div className="flex space-x-4 animate-pulse">
          <FaCar className="w-12 h-12 text-purple" />
          <FaCamera className="w-12 h-12 text-purple" />
          <FaBicycle className="w-12 h-12 text-purple" />
          <FaTshirt className="w-12 h-12 text-purple" />
          <FaHome className="w-12 h-12 text-purple" />
          <FaTools className="w-12 h-12 text-purple" />
        </div>
        <p className="mt-4 text-lg font-semibold text-gray-700">Loading Rentifyhub........</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;