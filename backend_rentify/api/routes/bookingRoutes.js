const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Create a new booking
router.post("/", bookingController.createBooking);

// Check date availability
router.get("/availability/:itemId", bookingController.checkAvailability);

// Get all bookings (admin only)
router.get("/", bookingController.getAllBookings);

// Get booking by ID
router.get("/:bookingId", bookingController.getBookingById);

// Update booking status
router.patch("/:bookingId/status", bookingController.updateBookingStatus);

// Get user's bookings
router.get("/user/:userId", bookingController.getUserBookings);

router.delete("/:bookingId", bookingController.deleteBooking);

// Add these new routes
router.patch("/:bookingId/active", bookingController.markAsActive);
router.patch("/:bookingId/complete", bookingController.markAsCompleted);


module.exports = router;