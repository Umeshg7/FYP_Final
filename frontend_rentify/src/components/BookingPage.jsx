import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import BookingCalendar from './BookingCalender';
import useAxiosSecure from '../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await axiosSecure.get(`/rent/item/${id}`);
        setItem(response.data);
      } catch (err) {
        setError('Failed to load item details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id, axiosSecure]);

  const handleBookingConfirm = async (selectedDates) => {
    try {
      console.log("Selected dates before submit:", selectedDates);
      
      const bookingData = {
        itemId: id,
        startDate: selectedDates[0], // first selected date
        endDate: selectedDates[selectedDates.length - 1], // last selected date
        totalPrice: selectedDates.length * item.pricePerDay,
        lenderId: item.userId, // assuming the item has owner info
        renterId: user._id // from your auth context
      };
  
      console.log("Submitting booking data:", bookingData);
      
      const response = await axiosSecure.post('/bookings', bookingData);
      console.log("Booking response:", response.data);
      
      // Success handling...
    } catch (error) {
      console.error("Full error details:", error);
      console.error("Error response:", error.response?.data);
      
      Swal.fire({
        icon: 'error',
        title: 'Booking Failed',
        text: error.response?.data?.message || 
             'Failed to create booking. Please check your data.',
      });
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;
  if (!item) return <div className="text-center py-12">Item not found</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Book {item.title}</h1>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <img 
              src={item.images?.[0] || 'https://via.placeholder.com/300'} 
              alt={item.title}
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="w-full md:w-2/3">
            <h2 className="text-xl font-bold mb-2">{item.title}</h2>
            <p className="text-gray-600 mb-4">{item.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Price Per Day:</span>
              <span className="text-xl font-bold text-purple-600">NPR {item.pricePerDay}</span>
            </div>
          </div>
        </div>
      </div>

      <BookingCalendar 
        itemId={id}
        pricePerDay={item.pricePerDay}
        onBookingConfirm={handleBookingConfirm}
      />
    </div>
  );
};

export default BookingPage;