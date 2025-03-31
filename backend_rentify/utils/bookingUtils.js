// utils/bookingUtils.js
const Booking = require('../api/models/Booking');

const checkDateAvailability = async (itemId, startDate, endDate, excludeBookingId = null) => {
  const query = {
    item: itemId,
    $or: [
      {
        startDate: { $lt: new Date(endDate) },
        endDate: { $gt: new Date(startDate) }
      }
    ],
    status: { $nin: ["cancelled", "rejected"] } // Only consider active bookings
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBookings = await Booking.find(query);
  return conflictingBookings.length === 0;
};

module.exports = { checkDateAvailability };