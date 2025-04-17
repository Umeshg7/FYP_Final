import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle,
  FaUserTie,
  FaUser,
  FaInfoCircle,
  FaHandHolding,
  FaBoxOpen,
  FaStar
} from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { format } from 'date-fns';
import useAuth from "../../../hooks/useAuth";
import { toast } from "react-hot-toast";

const UserBookings = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [cancellationReason, setCancellationReason] = useState("");
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [bookingToReview, setBookingToReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

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
    .filter(booking => booking.status === "completed")
    .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  
  return { earnings, spent };
};

  const { earnings, spent } = calculateTotals();

  // Handle status updates
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionLoading(true);
    try {
      const updateData = { 
        status: newStatus,
        ...(["cancelled", "rejected"].includes(newStatus) && { cancellationReason }) 
      };

      const response = await axiosSecure.patch(
        `/bookings/${bookingId}/status`,
        updateData
      );
      
      if (response.data.success) {
        toast.success(`Booking marked as ${newStatus.replace('_', ' ')}`);
        setCancellationReason("");
        setBookingToCancel(null);
        
        // If status was changed to completed and user is renter, show review modal
        if (newStatus === "completed") {
          const booking = bookings.find(b => b._id === bookingId);
          if (booking && (booking.renter?._id === user?.uid || booking.renter === user?.uid)) {
            setBookingToReview(booking);
          }
        }
        
        refetch();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  console.log("Current token:", localStorage.getItem('access-token'));

  // Handle review submission
  const handleSubmitReview = async () => {
    // 1. Validate rating
    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      toast.error("Please select a valid rating (1-5 stars)");
      return;
    }
  
    // 2. Validate booking reference
    if (!bookingToReview?._id) {
      toast.error("Invalid booking reference");
      return;
    }
  
    try {
      // 3. Prepare payload with fixed 'renter' role
      const payload = {
        rating: numericRating,
        comment: reviewComment?.trim() || "",
        reviewerRole: 'renter' // Directly set as renter
      };
  
      console.log("Submitting review payload:", payload);
  
      // 4. Make the API request
      const response = await axiosSecure.post(
        `/bookings/${bookingToReview._id}/reviews`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000 // 5 second timeout
        }
      );
  
      // 5. Handle success
      if (response.data.success) {
        toast.success("Review submitted successfully!");
        setBookingToReview(null);
        setRating(0);
        setReviewComment("");
        refetch(); // Refresh data
      } else {
        throw new Error(response.data.message || "Unknown error occurred");
      }
  
    } catch (error) {
      console.error("Complete review error details:", {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
  
      // 6. User-friendly error messages
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         "Failed to submit review. Please try again.";
  
      toast.error(errorMessage);
  
      // 7. Special case handling
      if (error.response?.status === 401) {
        // Handle unauthorized (e.g., redirect to login)
      }
    }
  };
  // Format date display
  const formatDate = (dateString) => format(new Date(dateString), 'MMM dd, yyyy');

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  // Status badge component
  const StatusBadge = ({ status }) => (
    <span className={`badge ${
      status === 'confirmed' ? 'badge-success' :
      status === 'pending' ? 'badge-warning' :
      status === 'active' ? 'badge-primary' :
      status === 'completed' ? 'badge-accent' :
      ['cancelled', 'rejected'].includes(status) ? 'badge-error' :
      'badge-neutral'
    }`}>
      {status.replace('_', ' ')}
    </span>
  );

  // Booking table component
  const BookingTable = ({ bookings, role }) => (
    <div className="overflow-x-auto bg-white rounded-lg shadow mb-8">
      <h2 className="text-xl font-bold p-4 bg-gray-100">
        {role === "lender" ? "Items You're Lending" : "Items You're Renting"}
      </h2>
      <table className="table w-full">
        <thead className="bg-purple text-white">
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
            const amountLabel = role === "lender" ? "Earn" : "Paid";
            const canReview = role === "renter" && 
                             booking.status === "completed" && 
                             !booking.review?.rating;

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
                  <StatusBadge status={booking.status} />
                </td>
                <td>
                  <div className="flex gap-2 flex-wrap">
                    <button 
                      className="btn btn-xs btn-ghost"
                      onClick={() => setSelectedBooking(booking)}
                      title="Details"
                    >
                      <FaInfoCircle />
                    </button>
                    
                    {/* Lender actions */}
                    {role === "lender" && (
                      <>
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(booking._id, "confirmed")}
                              className="btn btn-xs btn-success text-white"
                              title="Confirm"
                              disabled={actionLoading}
                            >
                              <FaCheckCircle />
                            </button>
                            <button
                              onClick={() => setBookingToCancel(booking._id)}
                              className="btn btn-xs btn-error text-white"
                              title="Reject"
                              disabled={actionLoading}
                            >
                              <FaTimesCircle />
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateStatus(booking._id, "active")}
                            className="btn btn-xs btn-primary text-white"
                            title="Mark as Active (Item Handed Over)"
                            disabled={actionLoading}
                          >
                            <FaHandHolding />
                          </button>
                        )}
                        {booking.status === 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(booking._id, "completed")}
                            className="btn btn-xs btn-accent text-white"
                            title="Mark as Completed (Item Returned)"
                            disabled={actionLoading}
                          >
                            <FaBoxOpen />
                          </button>
                        )}
                      </>
                    )}
                    
                    {/* Renter actions */}
                    {role === "renter" && (
                      <>
                        {['pending', 'confirmed'].includes(booking.status) && (
                          <button
                            onClick={() => setBookingToCancel(booking._id)}
                            className="btn btn-xs btn-error text-white"
                            title="Cancel"
                            disabled={actionLoading}
                          >
                            <FaTimesCircle />
                          </button>
                        )}
                        {canReview && (
                          <button
                            onClick={() => setBookingToReview(booking)}
                            className="btn btn-xs btn-warning text-white"
                            title="Leave Review"
                          >
                            <FaStar />
                          </button>
                        )}
                      </>
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
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="btn btn-error"
                onClick={() => {
                  const isReject = bookings.find(b => b._id === bookingToCancel)?.status === 'pending';
                  handleUpdateStatus(bookingToCancel, isReject ? "rejected" : "cancelled");
                }}
                disabled={actionLoading || !cancellationReason.trim()}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
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
              <p><strong>Status:</strong> <StatusBadge status={selectedBooking.status} /></p>
              {selectedBooking.cancellationReason && (
                <p><strong>Cancellation Reason:</strong> {selectedBooking.cancellationReason}</p>
              )}
              {selectedBooking.paymentMethod && (
                <p><strong>Payment Method:</strong> {selectedBooking.paymentMethod}</p>
              )}
              {selectedBooking.review?.rating && (
                <>
                  <p><strong>Your Rating:</strong> {selectedBooking.review.rating}/5</p>
                  {selectedBooking.review.comment && (
                    <p><strong>Your Review:</strong> {selectedBooking.review.comment}</p>
                  )}
                </>
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

      {/* Review Modal */}
      {bookingToReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Leave a Review</h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium mb-2">How would you rate this rental experience?</p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-3xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <FaStar />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="font-medium mb-2 block">Your Review (optional)</label>
                <textarea
                  className="textarea textarea-bordered w-full"
                  placeholder="Share your experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{bookingToReview.item?.title}</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(bookingToReview.startDate)} - {formatDate(bookingToReview.endDate)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-ghost"
                    onClick={() => {
                      setBookingToReview(null);
                      setRating(0);
                      setReviewComment("");
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSubmitReview}
                    disabled={!rating}
                  >
                    Submit Review
                  </button>
                </div>
              </div>
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
            <div className="stat-value">NPR : {earnings.toFixed(2)}</div>
          </div>
        </div>
        
        <div className="stats shadow bg-blue-50">
          <div className="stat">
            <div className="stat-title">Spent (as Renter)</div>
            <div className="stat-value">NPR : {spent.toFixed(2)}</div>
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