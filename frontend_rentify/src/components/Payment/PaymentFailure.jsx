import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';

const PaymentFailure = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const bookingId = query.get('bookingId');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="text-red-500 flex justify-center mb-4">
          <FaTimesCircle size={50} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
        <p className="mb-6">We couldn't process your payment. Please try again.</p>
        {bookingId && (
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="font-semibold">Booking ID: {bookingId}</p>
          </div>
        )}
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/bookings/${bookingId}`)}
            className="btn btn-outline flex-1"
          >
            Try Again
          </button>
          <button 
            onClick={() => navigate('/')}
            className="btn btn-ghost flex-1"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;