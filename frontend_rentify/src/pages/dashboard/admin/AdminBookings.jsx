import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { FaTrashAlt, FaCalendarAlt } from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { format } from 'date-fns';

const AdminBookings = () => {
  const axiosSecure = useAxiosSecure();
  const [cancellationReason, setCancellationReason] = useState("");
  const [bookingToCancel, setBookingToCancel] = useState(null);

  const { 
    data: bookingsData = {}, 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: async () => {
      const res = await axiosSecure.get("/bookings");
      return res.data;
    },
  });

  // Safely extract bookings array from response
  const bookings = bookingsData.bookings || bookingsData.data || [];
  
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      let updateData = { status: newStatus };
      
      if (newStatus === "cancelled") {
        if (!cancellationReason.trim()) {
          alert("Please enter a cancellation reason");
          return;
        }
        updateData.cancellationReason = cancellationReason;
      }

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
      console.error("Status update failed:", error);
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    
    try {
      const response = await axiosSecure.delete(`/bookings/${bookingId}`);
      if (response.data.success) {
        alert("Booking deleted successfully");
        refetch();
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert(error.response?.data?.message || "Failed to delete booking");
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading bookings...</div>;
  }

  if (!Array.isArray(bookings)) {
    return (
      <div className="text-center py-8 text-red-500">
        Error: Bookings data is not in expected format
        <pre>{JSON.stringify(bookingsData, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Cancellation Reason Modal */}
      {bookingToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Cancellation Reason</h3>
            <textarea
              className="textarea textarea-bordered w-full mb-4"
              placeholder="Enter reason for cancellation..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
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
                onClick={() => {
                  handleUpdateStatus(bookingToCancel, "cancelled");
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Bookings Management</h2>
        <div className="badge badge-primary">
          Total Bookings: {bookings.length}
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="table w-full">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Lender</th>
              <th>Renter</th>
              <th>Dates</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, index) => (
              <tr key={booking._id} className="hover:bg-blue-50">
                <td>{index + 1}</td>
                <td>
                  <div className="flex items-center gap-2">
                    {booking.item?.images?.[0] && (
                      <img 
                        src={booking.item.images[0]} 
                        alt={booking.item.title} 
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <span>{booking.item?.title || 'N/A'}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <img 
                      src={booking.lender?.photoURL || "https://via.placeholder.com/40"} 
                      alt={booking.lender?.name} 
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{booking.lender?.name || 'N/A'}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <img 
                      src={booking.renter?.photoURL || "https://via.placeholder.com/40"} 
                      alt={booking.renter?.name} 
                      className="w-8 h-8 rounded-full"
                    />
                    <span>{booking.renter?.name || 'N/A'}</span>
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
                <td>NPR : {booking.totalPrice?.toFixed(2) || '0.00'}</td>
                <td>
                  <div className="flex gap-2">
                    <select
                      className="select select-bordered select-xs"
                      value={booking.status}
                      onChange={(e) => {
                        if (e.target.value === "cancelled") {
                          setBookingToCancel(booking._id);
                        } else {
                          handleUpdateStatus(booking._id, e.target.value);
                        }
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirm</option>
                      <option value="cancelled">Cancel</option>
                      <option value="completed">Complete</option>
                    </select>
                    <button 
                      onClick={() => handleDeleteBooking(booking._id)}
                      className="btn btn-xs btn-error text-white"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookings;