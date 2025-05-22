import React, { useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../../../Contexts/AuthProvider";

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [rentItems, setRentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId"); // or get from context

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingRes, rentRes] = await Promise.all([
          axios.get(`/bookings/user/${userId}`),
          axios.get(`/rent/user/${userId}`)
        ]);
        setBookings(bookingRes.data || []);
        setRentItems(rentRes.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setLoading(false);
      }
    };

    if (userId) fetchData();
  }, [userId]);

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Welcome to Your Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-medium">Total Bookings</h2>
          <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-medium">Items Listed</h2>
          <p className="text-3xl font-bold text-green-600">{rentItems.length}</p>
        </div>

        <div className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-medium">Upcoming Booking</h2>
          {bookings.length > 0 ? (
            <div>
              <p className="font-semibold">{bookings[0].item?.title || "Item"}</p>
              <p className="text-sm text-gray-500">
                {new Date(bookings[0].startDate).toLocaleDateString()} →{" "}
                {new Date(bookings[0].endDate).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No bookings</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Your Listed Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rentItems.map((item) => (
            <div key={item._id} className="bg-white shadow-md rounded-xl p-4">
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
              <p className="text-sm mt-1 text-blue-600">Rs. {item.pricePerDay}/day</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
