import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { 
  FaUser,
  FaMoneyBillWave,
  FaShoppingCart,
  FaExchangeAlt,
  FaCalendarAlt,
  FaInfoCircle
} from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { format } from 'date-fns';
import { toast } from "react-hot-toast";

const Earning = () => {
  const axiosSecure = useAxiosSecure();
  const [selectedUser, setSelectedUser] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  // Fetch all bookings for admin view
  const { data: bookingsData = {}, isLoading, refetch } = useQuery({
    queryKey: ["admin-financials", dateRange],
    queryFn: async () => {
      const params = {};
      if (dateRange.start) params.startDate = dateRange.start;
      if (dateRange.end) params.endDate = dateRange.end;
      
      const res = await axiosSecure.get('/bookings', { params });
      return res.data;
    }
  });

  const bookings = bookingsData.bookings || [];

  // Extract unique users from bookings (both lenders and renters)
  const extractUniqueUsers = () => {
    const usersMap = new Map();
    
    bookings.forEach(booking => {
      // Add lender if not already in map
      if (booking.lender && !usersMap.has(booking.lender._id)) {
        usersMap.set(booking.lender._id, booking.lender);
      }
      
      // Add renter if not already in map
      if (booking.renter && !usersMap.has(booking.renter._id)) {
        usersMap.set(booking.renter._id, booking.renter);
      }
    });
    
    return Array.from(usersMap.values());
  };

  const users = extractUniqueUsers();

  // Calculate financial statistics for all users
  const calculateUserStats = () => {
    return users.map(user => {
      const userBookings = bookings.filter(b => 
        b.lender?._id === user._id || b.renter?._id === user._id
      );

      const earnings = userBookings
        .filter(b => b.lender?._id === user._id && b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      const spent = userBookings
        .filter(b => b.renter?._id === user._id && b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

      return {
        ...user,
        earnings,
        spent,
        net: earnings - spent,
        bookingCount: userBookings.length,
        completedBookings: userBookings.filter(b => b.status === 'completed').length
      };
    });
  };

  const userStats = calculateUserStats();

  // Calculate platform totals
  const platformTotals = {
    totalEarnings: userStats.reduce((sum, user) => sum + user.earnings, 0),
    totalSpent: userStats.reduce((sum, user) => sum + user.spent, 0),
    totalBookings: bookings.length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    platformRevenue: userStats.reduce((sum, user) => sum + user.earnings, 0) * 0.1 // Assuming 10% platform fee
  };

  // Format date display
  const formatDate = (dateString) => format(new Date(dateString), 'MMM dd, yyyy');

  if (isLoading) return <div className="text-center py-8">Loading financial data...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Financial Dashboard</h1>
      
      {/* Date Range Filter */}
      

      {/* Platform Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stats bg-white shadow">
          <div className="stat">
            <div className="stat-figure text-primary">
              <FaMoneyBillWave className="text-xl" />
            </div>
            <div className="stat-title">Platform Revenue</div>
            <div className="stat-value">Rs {platformTotals.platformRevenue.toFixed(2)}</div>
            <div className="stat-desc">10% of total earnings</div>
          </div>
        </div>
        
        <div className="stats bg-white shadow">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <FaExchangeAlt className="text-xl" />
            </div>
            <div className="stat-title">Total Transactions</div>
            <div className="stat-value">{platformTotals.totalBookings}</div>
            <div className="stat-desc">{platformTotals.completedBookings} completed</div>
          </div>
        </div>
        
        <div className="stats bg-white shadow">
          <div className="stat">
            <div className="stat-figure text-green-500">
              <FaMoneyBillWave className="text-xl" />
            </div>
            <div className="stat-title">Users Earned</div>
            <div className="stat-value">Rs {platformTotals.totalEarnings.toFixed(2)}</div>
            <div className="stat-desc">From {userStats.length} users</div>
          </div>
        </div>
        
        <div className="stats bg-white shadow">
          <div className="stat">
            <div className="stat-figure text-blue-500">
              <FaShoppingCart className="text-2xl" />
            </div>
            <div className="stat-title">Users Spent</div>
            <div className="stat-value">Rs {platformTotals.totalSpent.toFixed(2)}</div>
            <div className="stat-desc">On {platformTotals.completedBookings} rentals</div>
          </div>
        </div>
      </div>

      {/* User Financial Statistics Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-100">
              <tr>
                <th>User</th>
                <th className="text-right">Earned</th>
                <th className="text-right">Spent</th>
                <th className="text-right">Bookings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {userStats.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <img src={user.photoURL} alt={user.name} />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{user.name}</div>
                        <div className="text-sm opacity-50">{user.email}</div>
                        <div className="text-xs mt-1">
                          {user.kycVerified ? (
                            <span className="badge badge-success badge-xs">KYC Verified</span>
                          ) : (
                            <span className="badge badge-warning badge-xs">Unverified</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right font-medium text-green-600">
                    Rs {user.earnings.toFixed(2)}
                  </td>
                  <td className="text-right font-medium text-blue-600">
                    Rs {user.spent.toFixed(2)}
                  </td>

                  <td className="text-right">
                    <div className="flex flex-col items-end">
                      <span>{user.bookingCount}</span>
                      <span className="text-xs text-gray-500">
                        ({user.completedBookings} completed)
                      </span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => setSelectedUser(user)}
                    >
                      <FaInfoCircle /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaUser /> {selectedUser.name}'s Financial Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="stats bg-gray-50">
                <div className="stat">
                  <div className="stat-title">Total Earnings</div>
                  <div className="stat-value text-green-600">
                    NPR {selectedUser.earnings.toFixed(2)}
                  </div>
                  <div className="stat-desc">As lender</div>
                </div>
              </div>
              
              <div className="stats bg-gray-50">
                <div className="stat">
                  <div className="stat-title">Total Spent</div>
                  <div className="stat-value text-blue-600">
                    NPR {selectedUser.spent.toFixed(2)}
                  </div>
                  <div className="stat-desc">As renter</div>
                </div>
              </div>
            </div>
            
            <h4 className="font-semibold mb-2">Recent Transactions</h4>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Dates</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings
                    .filter(b => b.lender?._id === selectedUser._id || b.renter?._id === selectedUser._id)
                    .slice(0, 5)
                    .map(booking => (
                      <tr key={booking._id}>
                        <td>{booking.item?.title}</td>
                        <td>
                          {booking.lender?._id === selectedUser._id ? (
                            <span className="badge badge-success">Lent</span>
                          ) : (
                            <span className="badge badge-primary">Rented</span>
                          )}
                        </td>
                        <td>NPR {booking.totalPrice?.toFixed(2)}</td>
                        <td>
                          <div className="flex items-center gap-1">
                            <FaCalendarAlt className="text-xs" />
                            {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            booking.status === 'completed' ? 'badge-success' :
                            booking.status === 'pending' ? 'badge-warning' :
                            'badge-neutral'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            
            <div className="modal-action">
              <button 
                className="btn"
                onClick={() => setSelectedUser(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Earning;