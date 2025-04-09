import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const query = new URLSearchParams(location.search);
  const bookingId = query.get('bookingId');

  useEffect(() => {
    if (bookingId) {
      const verifyPayment = async () => {
        try {
          const response = await axiosSecure.post('/bookings/verify-esewa', {
            bookingId,
            transactionId: query.get('transaction_id') || `esewa_${Date.now()}`
          });
          
          if (response.data.success) {
            toast.success('Payment verified successfully!');
          }
        } catch (error) {
          toast.error(error.response?.data?.message || "Payment verification failed");
        }
      };
      verifyPayment();
    }
  }, [bookingId, axiosSecure, query]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="text-green-500 flex justify-center mb-4">
          <FaCheckCircle size={50} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="mb-6">Your booking has been confirmed.</p>
        {bookingId && (
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="font-semibold">Booking ID: {bookingId}</p>
          </div>
        )}
        <button 
          onClick={() => navigate('/user-dashboard/lent')}
          className="btn btn-primary w-full"
        >
          View Bookings
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;