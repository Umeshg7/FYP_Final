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
import CryptoJS from "crypto-js";

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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

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
        if (booking.item._id !== itemId) return false;
        
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
                        ${isDisabled ? 'text-gray-300' : 'text-gray-800 cursor-pointer'}
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

  const handleSubmitBooking = async (paymentCompleted = false) => {
    if (!startDate || !endDate) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Dates',
        text: 'Please select both start and end dates',
      });
      return;
    }
  
    if (!acceptedTerms) {
      Swal.fire({
        icon: 'error',
        title: 'Terms Not Accepted',
        text: 'You must accept the rental terms and conditions to proceed',
      });
      return;
    }
  
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
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
      if (booking.item._id !== itemId) return false;
      
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
      const totalDays = differenceInDays(endDate, startDate) + 1;
      const totalPrice = totalDays * item.pricePerDay;
      const bookingPayment = Math.round(totalPrice * 0.1);

      const bookingData = {
        lender: item.userId,
        lenderEmail: item.userEmail,
        renter: user.uid,
        item: item._id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalPrice: totalPrice,
        paymentMethod: paymentMethod,
        acceptedTerms: true,
        status: paymentCompleted ? "confirmed" : "pending"
      };

      const res = await axiosSecure.post("/bookings", bookingData);
      
      if (paymentCompleted) {
        Swal.fire({
          icon: "success",
          title: "Booking Confirmed!",
          text: `Your payment of NPR ${bookingPayment} has been received`,
          showConfirmButton: false,
          timer: 2000
        });
        navigate("/user-dashboard/lent");
      } else if (paymentMethod === 'card') {
        Swal.fire({
          icon: "success",
          title: "Booking Request Sent!",
          text: `A 10% payment of NPR ${bookingPayment} is required to secure your booking`,
          showConfirmButton: false,
          timer: 2000
        });
        navigate("/user-dashboard/lent");
      }
      
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

  const EsewaPaymentButton = () => {
    const initiateEsewaPayment = () => {
      if (!startDate || !endDate) return;
      
      const totalDays = differenceInDays(endDate, startDate) + 1;
      const totalPrice = totalDays * item.pricePerDay;
      const bookingPayment = Math.round(totalPrice * 0.1);

      const secretKey = "8gBm/:&EnhH.1/q"; // Replace with your actual key
      const transactionUUID = `txn_${Date.now()}`;
      const totalAmount = bookingPayment;
      const productCode = "EPAYTEST";
      const signedFieldNames = "total_amount,transaction_uuid,product_code";

      const signatureBase = `total_amount=${totalAmount},transaction_uuid=${transactionUUID},product_code=${productCode}`;
      const signature = CryptoJS.HmacSHA256(signatureBase, secretKey).toString(CryptoJS.enc.Base64);

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

      const formData = {
        amount: totalAmount,
        tax_amount: 0,
        total_amount: totalAmount,
        transaction_uuid: transactionUUID,
        product_code: productCode,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${window.location.origin}/payment/success`,
        failure_url: `${window.location.origin}/payment/failure`,
        signed_field_names: signedFieldNames,
        signature: signature,
      };

      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      // Cleanup
      return () => {
        document.body.removeChild(form);
      };
    };

    return (
      <button 
        onClick={initiateEsewaPayment}
        disabled={!startDate || !endDate || !acceptedTerms}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
          !startDate || !endDate || !acceptedTerms
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-[#55D046] hover:bg-[#4bb53d]"
        }`}
      >
        Pay with eSewa
      </button>
    );
  };

  const TermsModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Rental Terms & Conditions</h3>
          
          <div className="text-sm space-y-3">
            <p>By booking this item, you agree to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Collect item between 8:00-10:00 AM on start date</li>
              <li>Return item before 8:00 AM on day after end date</li>
              <li>Late returns charged 50% of daily rate per hour</li>
              <li>You're responsible for any damage or loss</li>
              <li>Item must be returned in same condition</li>
              <li>Security deposit may be required</li>
              <li>Valid ID required at collection</li>
              <li>No modifications allowed to the item</li>
              <li>Report any issues immediately</li>
              <li>Cancellation policy applies if cancelled within 10 minutes of booking</li>
              <li>10% payment required to secure booking</li>
              <li>Remaining 90% to be paid when collecting the item</li>
            </ul>
          </div>

          <div className="mt-6 flex items-center">
            <input
              type="checkbox"
              id="modalAcceptTerms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="h-4 w-4 text-purple focus:ring-purple border-gray-300 rounded"
            />
            <label htmlFor="modalAcceptTerms" className="ml-2 block text-sm text-gray-700">
              I accept these terms and conditions
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowTermsModal(false)}
              className="px-4 py-2 bg-purple text-white rounded-md text-sm font-medium hover:bg-purple"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
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

  const totalDays = startDate && endDate ? differenceInDays(endDate, startDate) + 1 : 0;
  const totalPrice = totalDays * item.pricePerDay;
  const bookingPayment = Math.round(totalPrice * 0.1);

  return (
    <div className="bg-white min-h-screen py-10">
      {showTermsModal && <TermsModal />}
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-8 sm:py-12 lg:max-w-none lg:py-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Booking {item.title}</h1>
          
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Calendar Section */}
            <div className="w-full lg:w-1/2">
              <div className="bg-white border border-purple-200 p-6 rounded-3xl shadow-md">
                <h2 className="text-xl font-semibold mb-4">Select Dates</h2>
                <CustomCalendar 
                  dateRange={dateRange} 
                  onChange={setDateRange} 
                />
              </div>
            </div>
            
            {/* Booking Summary */}
            <div className="w-full lg:w-1/2">
              <div className="bg-white p-6 rounded-3xl shadow-md border border-purple-200">
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
                      {startDate && endDate ? `${totalDays} days` : "-"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Rental Price:</span>
                    <span className="font-medium">
                      {startDate && endDate ? `NPR ${totalPrice}` : "-"}
                    </span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Initial Payment (10%):</span>
                      <span className="text-purple">
                        {startDate && endDate ? `NPR ${bookingPayment}` : "-"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      This 10% payment secures your booking. The remaining 90% need to be paid when you collect the item.
                    </p>
                  </div>
                </div>
                
                {/* Compact Terms Acceptance */}
                <div className="mt-4 flex items-center">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onChange={(e) => {
                      if (!acceptedTerms) {
                        setShowTermsModal(true);
                      } else {
                        setAcceptedTerms(false);
                      }
                    }}
                    className="h-4 w-4 text-purple focus:ring-purple border-gray-300 rounded"
                  />
                  <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                    I accept all terms and conditions
                  </label>
                </div>

                {/* Payment Method Selection */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`px-4 py-2 rounded-lg border ${
                        paymentMethod === 'card' ? 'border-purple bg-purple-50 text-purple' : 'border-gray-300'
                      }`}
                    >
                      Credit/Debit Card
                    </button>
                    <button
                      onClick={() => setPaymentMethod('esewa')}
                      className={`px-4 py-2 rounded-lg border ${
                        paymentMethod === 'esewa' ? 'border-[#55D046] bg-[#f0f9ef] text-[#55D046]' : 'border-gray-300'
                      }`}
                    >
                      eSewa
                    </button>
                  </div>

                  {paymentMethod === 'card' ? (
                    <button
                      onClick={() => handleSubmitBooking()}
                      disabled={submitting || !startDate || !endDate || !acceptedTerms}
                      className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                        submitting || !startDate || !endDate || !acceptedTerms
                          ? "bg-purple-300 cursor-not-allowed"
                          : "bg-purple hover:bg-purple-700"
                      }`}
                    >
                      {submitting ? "Processing..." : "Pay 10% to Book Now"}
                    </button>
                  ) : (
                    <EsewaPaymentButton />
                  )}
                </div>
                
                <button
                  onClick={() => navigate(-1)}
                  className="w-full mt-4 py-3 px-4 rounded-lg border border-purple text-purple font-medium hover:bg-purple-50 transition-colors"
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