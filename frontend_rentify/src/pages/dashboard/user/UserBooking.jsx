import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle,
  FaUserTie,
  FaUser,
  FaInfoCircle
} from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { format } from 'date-fns';
import useAuth from "../../../hooks/useAuth";

const UserBookings = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [cancellationReason, setCancellationReason] = useState("");
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Fetch all bookings for current user
  const { data: bookingsData = {}, isLoading, refetch } = useQuery({
    queryKey: ["user-bookings", user?.uid],
    queryFn: async () => {
      const res = await axiosSecure.get(`/bookings/user/${user?.uid}`);
      return res.data;
    },
    enabled: !!user?.uid
  });

  const bookings = bookingsData.bookings || bookingsData.data || [];

  // Separate bookings into lending and renting
  const lendingBookings = bookings.filter(booking => 
    booking.lender?._id === user?.uid || booking.lender === user?.uid
  );
  
  const rentingBookings = bookings.filter(booking => 
    booking.lender?._id !== user?.uid && booking.lender !== user?.uid
  );

  // Calculate financial summaries
  const calculateTotals = () => {
    const earnings = lendingBookings
      .filter(booking => booking.status === "completed")
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    
    const spent = rentingBookings
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    
    return { earnings, spent };
  };

  const { earnings, spent } = calculateTotals();

  // Handle status updates
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const updateData = { 
        status: newStatus,
        ...(newStatus === "cancelled" && { cancellationReason }) 
      };

      const response = await axiosSecure.patch(
        `/bookings/${bookingId}/status`,
        updateData
      );
      
      if (response.data.success) {
        alert(`Booking ${newStatus} successfully`);
        setCancellationReason("");
        setBookingToCancel(null);
        refetch();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Action failed");
    }
  };

  // Format date display
  const formatDate = (dateString) => format(new Date(dateString), 'MMM dd, yyyy');

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  // Booking table component
  const BookingTable = ({ bookings, role }) => (
    <div className="overflow-x-auto bg-white rounded-lg shadow mb-8">
      <h2 className="text-xl font-bold p-4 bg-gray-100">
        {role === "lender" ? "Items You're Lending" : "Items You're Renting"}
      </h2>
      <table className="table w-full">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th>Item</th>
            <th>{role === "lender" ? "Renter" : "Lender"}</th>
            <th>Dates</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => {
            const counterparty = role === "lender" ? booking.renter : booking.lender;
            const amountLabel = role === "lender" ? "Earn" : "Pay";

            return (
              <tr key={booking._id} className="hover:bg-blue-50">
                <td>
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    {booking.item?.images?.[0] && (
                      <img 
                        src={booking.item.images[0]} 
                        alt={booking.item.title} 
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <span>{booking.item?.title}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <img 
                      src={counterparty?.photoURL || "https://via.placeholder.com/40"} 
                      alt={counterparty?.name} 
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p>{counterparty?.name}</p>
                      <p className="text-xs text-gray-500">{counterparty?.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="text-blue-500" />
                      {formatDate(booking.startDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="text-red-500" />
                      {formatDate(booking.endDate)}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="font-semibold">
                    ${booking.totalPrice?.toFixed(2)}
                    <div className="text-xs text-gray-500">{amountLabel}</div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${
                    booking.status === 'confirmed' ? 'badge-success' :
                    booking.status === 'pending' ? 'badge-warning' :
                    booking.status === 'cancelled' ? 'badge-error' :
                    'badge-info'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-xs btn-ghost"
                      onClick={() => setSelectedBooking(booking)}
                      title="Details"
                    >
                      <FaInfoCircle />
                    </button>
                    
                    {/* Lender actions */}
                    {role === "lender" && booking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(booking._id, "confirmed")}
                          className="btn btn-xs btn-success text-white"
                          title="Confirm"
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          onClick={() => setBookingToCancel(booking._id)}
                          className="btn btn-xs btn-error text-white"
                          title="Reject"
                        >
                          <FaTimesCircle />
                        </button>
                      </>
                    )}
                    
                    {/* Renter actions */}
                    {role === "renter" && ['pending', 'confirmed'].includes(booking.status) && (
                      <button
                        onClick={() => setBookingToCancel(booking._id)}
                        className="btn btn-xs btn-error text-white"
                        title="Cancel"
                      >
                        <FaTimesCircle />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {bookings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No {role === "lender" ? "lending" : "renting"} bookings found
        </div>
      )}
    </div>
  );

  return (
    <div className="p-4">
      {/* Cancellation Modal */}
      {bookingToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Cancellation Reason</h3>
            <textarea
              className="textarea textarea-bordered w-full mb-4"
              placeholder="Please specify the reason..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2">
              <button 
                className="btn btn-ghost"
                onClick={() => setBookingToCancel(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-error"
                onClick={() => handleUpdateStatus(bookingToCancel, "cancelled")}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Booking Details</h3>
            <div className="space-y-2">
              <p><strong>Item:</strong> {selectedBooking.item?.title}</p>
              <p><strong>Dates:</strong> {formatDate(selectedBooking.startDate)} to {formatDate(selectedBooking.endDate)}</p>
              <p><strong>Total:</strong> ${selectedBooking.totalPrice?.toFixed(2)}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 badge ${
                  selectedBooking.status === 'confirmed' ? 'badge-success' :
                  selectedBooking.status === 'pending' ? 'badge-warning' :
                  selectedBooking.status === 'cancelled' ? 'badge-error' :
                  'badge-info'
                }`}>
                  {selectedBooking.status}
                </span>
              </p>
              {selectedBooking.cancellationReason && (
                <p><strong>Cancellation Reason:</strong> {selectedBooking.cancellationReason}</p>
              )}
            </div>
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Total Bookings</div>
            <div className="stat-value">{bookings.length}</div>
          </div>
        </div>
        
        <div className="stats shadow bg-green-50">
          <div className="stat">
            <div className="stat-title">Earnings (as Lender)</div>
            <div className="stat-value">${earnings.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="stats shadow bg-blue-50">
          <div className="stat">
            <div className="stat-title">Spent (as Renter)</div>
            <div className="stat-value">${spent.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Lending Bookings */}
      <BookingTable bookings={lendingBookings} role="lender" />
      
      {/* Renting Bookings */}
      <BookingTable bookings={rentingBookings} role="renter" />
    </div>
  );
};

export default UserBookings;