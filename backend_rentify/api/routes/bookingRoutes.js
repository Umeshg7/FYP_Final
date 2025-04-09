const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const verifyToken = require('../middleware/verifyToken');

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

// Delete booking
router.delete("/:bookingId", bookingController.deleteBooking);

// Mark as active/completed
router.patch("/:bookingId/active", bookingController.markAsActive);
router.patch("/:bookingId/complete", bookingController.markAsCompleted);

// Add review to booking
router.post('/:bookingId/reviews', bookingController.submitReview); // Removed 'protect' middleware
router.get('/items/:itemId/reviews', bookingController.getItemReviews);
module.exports = router;