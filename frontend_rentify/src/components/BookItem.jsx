import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxiosSecure from "../hooks/useAxiosSecure";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";
import { 
  differenceInDays, 
  format, 
  isWithinInterval, 
  parseISO, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths
} from "date-fns";

const BookItem = () => {
  const { id: itemId } = useParams();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const itemRes = await axiosSecure.get(`/rent/item/${itemId}`);
        setItem(itemRes.data);
        
        const bookingsRes = await axiosSecure.get(`/bookings?itemId=${itemId}`);
        const processedBookings = bookingsRes.data.bookings.map(booking => ({
          ...booking,
          startDate: parseISO(booking.startDate),
          endDate: parseISO(booking.endDate)
        }));
        setBookings(processedBookings || []);
        
      } catch (err) {
        setError(err.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load booking information",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [itemId, axiosSecure]);

  const CustomCalendar = ({ dateRange, onChange }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedStart, selectedEnd] = dateRange;

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const weeks = [];
    let week = [];
    
    monthDays.forEach((day, i) => {
      week.push(day);
      if (i % 7 === 6 || i === monthDays.length - 1) {
        weeks.push(week);
        week = [];
      }
    });

    const isBooked = (day) => {
      return bookings.some(booking => {
        if (["cancelled", "rejected"].includes(booking.status)) return false;
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        return isWithinInterval(day, { start: bookingStart, end: bookingEnd });
      });
    };

    const isSelected = (day) => {
      return (selectedStart && isSameDay(day, selectedStart)) || 
             (selectedEnd && isSameDay(day, selectedEnd)) ||
             (selectedStart && selectedEnd && isWithinInterval(day, { 
               start: selectedStart, 
               end: selectedEnd 
             }));
    };

    const handleDateClick = (day) => {
      if (!isSameMonth(day, currentMonth)) return;
      if (isBooked(day)) return;
      
      if (!selectedStart || (selectedStart && selectedEnd)) {
        onChange([day, null]);
      } else if (day > selectedStart) {
        onChange([selectedStart, day]);
      } else {
        onChange([day, selectedStart]);
      }
    };

    const prevMonth = () => {
      setCurrentMonth(addMonths(currentMonth, -1));
    };

    const nextMonth = () => {
      setCurrentMonth(addMonths(currentMonth, 1));
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={prevMonth}
            className="p-2 rounded hover:bg-gray-100"
          >
            &lt;
          </button>
          <h3 className="font-semibold text-lg">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <button 
            onClick={nextMonth}
            className="p-2 rounded hover:bg-gray-100"
          >
            &gt;
          </button>
        </div>
        
        <table className="w-full border-separate border-spacing-1">
          <thead>
            <tr>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <th key={day} className="text-xs font-medium text-gray-500 py-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, weekIndex) => (
              <tr key={weekIndex}>
                {week.map((day, dayIndex) => {
                  const isDisabled = !isSameMonth(day, currentMonth) || isBooked(day);
                  const isStart = selectedStart && isSameDay(day, selectedStart);
                  const isEnd = selectedEnd && isSameDay(day, selectedEnd);
                  const isInRange = selectedStart && selectedEnd && 
                                   day > selectedStart && day < selectedEnd;
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <td 
                      key={dayIndex}
                      onClick={() => handleDateClick(day)}
                      className={`
                        text-center py-2 text-sm
                        ${isDisabled ? 'text-gray-400' : 'text-gray-800 cursor-pointer'}
                        ${isBooked(day) ? 'bg-red font-medium' : ''}
                        ${isToday && !isSelected(day) ? 'border border-purple font-bold' : ''}
                        ${isStart || isEnd || isInRange ? 'bg-purple text-white' : ''}
                        rounded-md
                      `}
                    >
                      {format(day, "d")}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-4 flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red mr-2 rounded-md"></div>
            <span className="text-xs text-gray-600">Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-purple mr-2 rounded-md"></div>
            <span className="text-xs text-gray-600">Selected</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 border border-purple bg-white mr-2 rounded-md"></div>
            <span className="text-xs text-gray-600">Today</span>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmitBooking = async () => {
    if (!startDate || !endDate) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Dates',
        text: 'Please select both start and end dates',
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Dates',
        text: 'End date must be after start date',
      });
      return;
    }

    if (start < new Date()) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Dates',
        text: 'Start date cannot be in the past',
      });
      return;
    }

    // Check if any dates in range are booked
    const isRangeAvailable = !bookings.some(booking => {
      if (["cancelled", "rejected"].includes(booking.status)) return false;
      const bookingStart = new Date(booking.startDate);
      const bookingEnd = new Date(booking.endDate);
      return (
        (start >= bookingStart && start <= bookingEnd) ||
        (end >= bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      );
    });
    
    if (!isRangeAvailable) {
      Swal.fire({
        icon: 'error',
        title: 'Not Available',
        text: 'Some dates in your selection are already booked',
      });
      return;
    }

    try {
      setSubmitting(true);
      const bookingData = {
        lender: item.userId,
        renter: user.uid,
        item: item._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        paymentMethod: "card"
      };

      const res = await axiosSecure.post("/bookings", bookingData);
      
      Swal.fire({
        icon: "success",
        title: "Booking Request Sent!",
        text: "The owner will confirm your booking shortly",
        showConfirmButton: false,
        timer: 2000
      });
      
      navigate(`/bookings/${res.data.booking._id}`);
      
    } catch (err) {
      console.error("Booking error:", err.response?.data || err.message);
      let errorMessage = "Could not complete booking";
      
      if (err.response?.data?.missingFields) {
        errorMessage = `Missing required fields: ${err.response.data.missingFields.join(", ")}`;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: errorMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500 text-xl">Product not found</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-8 sm:py-12 lg:max-w-none lg:py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Book {item.title}</h1>
          
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Calendar Section */}
            <div className="w-full lg:w-1/2">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Select Dates</h2>
                <CustomCalendar 
                  dateRange={dateRange} 
                  onChange={setDateRange} 
                />
              </div>
            </div>
            
            {/* Booking Summary */}
            <div className="w-full lg:w-1/2">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-6">Booking Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Selected Dates:</span>
                    <span className="font-medium">
                      {startDate && endDate ? (
                        `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`
                      ) : (
                        "Not selected"
                      )}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-700">Daily Price:</span>
                    <span className="font-medium">NPR {item.pricePerDay}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-700">Number of Days:</span>
                    <span className="font-medium">
                      {startDate && endDate ? (
                        `${differenceInDays(endDate, startDate) + 1} days`
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Price:</span>
                      <span className="text-purple">
                        {startDate && endDate ? (
                          `NPR ${(differenceInDays(endDate, startDate) + 1) * item.pricePerDay}`
                        ) : (
                          "-"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleSubmitBooking}
                  disabled={submitting || !startDate || !endDate}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                    submitting || !startDate || !endDate 
                      ? "bg-purple cursor-not-allowed" 
                      : "bg-purple hover:bg-purplehover"
                  }`}
                >
                  {submitting ? "Processing..." : "Confirm Booking"}
                </button>
                
                <button
                  onClick={() => navigate(-1)}
                  className="w-full mt-4 py-3 px-4 rounded-lg border border-purple text-purple font-medium  transition-colors"
                >
                  Back to Item
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookItem;