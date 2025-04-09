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

router.patch('/:bookingId/verify-payment', async (req, res) => {
    try {
      const { bookingId } = req.params;
      const { paymentMethod, paymentStatus, status } = req.body;
      
      const updatedBooking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          paymentMethod,
          paymentStatus,
          status,
          paidAmount: req.body.amount || 0,
          paymentDate: new Date()
        },
        { new: true }
      );
      
      if (!updatedBooking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      
      res.json({ success: true, booking: updatedBooking });
    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({ success: false, message: 'Payment verification failed' });
    }
  });
  
  // Delete booking for failed payments
  router.delete('/:bookingId', async (req, res) => {
    try {
      const { bookingId } = req.params;
      await Booking.findByIdAndDelete(bookingId);
      res.json({ success: true });
    } catch (error) {
      console.error('Booking deletion error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete booking' });
    }
  });
module.exports = router;