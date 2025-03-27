import React, { useState, useEffect } from 'react';
import { format, addDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { FaRegCalendarAlt, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

const BookingCalendar = ({ itemId, pricePerDay, onBookingConfirm }) => {
  const [selectedDates, setSelectedDates] = useState([]);
  const [days, setDays] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  
  // Generate days for the current week
  useEffect(() => {
    const startDate = addDays(new Date(), currentWeek * 7);
    const endDate = addDays(startDate, 6);
    const daysInWeek = eachDayOfInterval({ start: startDate, end: endDate });
    setDays(daysInWeek);
  }, [currentWeek]);

  // Handle date selection
  const handleDateClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    
    setSelectedDates(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });
  };

  // Calculate total price
  const calculateTotal = () => {
    return selectedDates.length * pricePerDay;
  };

  // Navigate weeks
  const prevWeek = () => setCurrentWeek(prev => prev - 1);
  const nextWeek = () => setCurrentWeek(prev => prev + 1);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <FaRegCalendarAlt className="mr-2" /> Select Booking Dates
        </h2>
        <div className="flex items-center space-x-4">
          <button onClick={prevWeek} className="p-2 rounded-full hover:bg-gray-100">
            <FaArrowLeft />
          </button>
          <span className="font-medium">Week {currentWeek + 1}</span>
          <button onClick={nextWeek} className="p-2 rounded-full hover:bg-gray-100">
            <FaArrowRight />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6">
        {days.map(day => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = selectedDates.includes(dateStr);
          const isPast = isSameDay(day, new Date()) && new Date() > day;

          return (
            <button
              key={dateStr}
              onClick={() => !isPast && handleDateClick(day)}
              disabled={isPast}
              className={`p-3 rounded flex flex-col items-center ${
                isSelected 
                  ? 'bg-purple-600 text-white' 
                  : isPast 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <span className="text-sm font-medium">{format(day, 'EEE')}</span>
              <span className="text-lg">{format(day, 'd')}</span>
            </button>
          );
        })}
      </div>

      {selectedDates.length > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-bold mb-2">Booking Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-1">Selected Dates:</h4>
              <ul className="space-y-1">
                {selectedDates.map(date => (
                  <li key={date} className="text-sm">
                    {format(new Date(date), 'MMM d, yyyy')}
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-right">
              <h4 className="font-medium mb-1">Total Price:</h4>
              <p className="text-xl font-bold">NPR {calculateTotal().toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onBookingConfirm(selectedDates)}
          disabled={selectedDates.length === 0}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
};

export default BookingCalendar;