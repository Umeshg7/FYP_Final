const Booking = require("../models/Booking");
const Rent = require("../models/Rent");
const User = require("../models/User")
const { checkDateAvailability } = require('../../utils/bookingUtils');
const nodemailer = require("nodemailer");
const { transporter } = require('../../utils/email');



    

// Create a new booking

exports.createBooking = async (req, res) => {
  try {
    const { lender, lenderEmail, renter, item, startDate, endDate, paymentMethod } = req.body;

    // 1. Validate date range
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ error: "End date must be after start date" });
    }

    // 2. Check availability
    const isAvailable = await checkDateAvailability(item, startDate, endDate);
    if (!isAvailable) {
      return res.status(409).json({ error: "Selected dates are not available" });
    }

    // 3. Calculate price
    const itemDetails = await Rent.findById(item);
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalPrice = itemDetails.pricePerDay * days;

    // 4. Create booking
    const booking = new Booking({
      lender,
      renter,
      item,
      startDate,
      endDate,
      totalPrice,
      paymentMethod,
      status: "pending",
    });

    await booking.save();

    // 5. Send email (non-blocking)
    sendBookingEmail({
      to: lenderEmail,
      bookingId: booking._id,
      startDate,
      endDate,
      totalPrice,
    }).catch(err => console.error("Email error:", err));

    // 6. Return success
    res.status(201).json({ success: true, booking });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


const sendBookingEmail = async ({ to, bookingId, startDate, endDate, totalPrice }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Rental App" <${process.env.GMAIL_USER}>`,
    to,
    subject: "📅 New Booking Request!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6b46c1;">New Booking Alert!</h2>
        <p>You have a new booking request:</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Booking ID:</strong> ${bookingId}</p>
          <p><strong>Dates:</strong> ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}</p>
          <p><strong>Total Price:</strong> $${totalPrice}</p>
        </div>
        <a href="http://localhost:5173/" 
           style="display: inline-block; background: #6b46c1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Booking
        </a>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Check date availability
exports.checkAvailability = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { startDate, endDate } = req.query;

        if (!itemId || !startDate || !endDate) {
            return res.status(400).json({ 
                success: false,
                message: "Missing required parameters" 
            });
        }

        const isAvailable = await checkDateAvailability(itemId, startDate, endDate);

        res.json({
            success: true,
            available: isAvailable,
            message: isAvailable 
                ? "Dates are available" 
                : "Dates are not available"
        });

    } catch (error) {
        console.error("Error checking availability:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message 
        });
    }
};

// Get all bookings
// controllers/bookingController.js
exports.getAllBookings = async (req, res) => {
    try {
      const bookings = await Booking.find()
        .populate({
          path: 'lender',
          model: 'User',
          select: 'name email photoURL kycVerified'
        })
        .populate({
          path: 'renter',
          model: 'User',
          select: 'name email photoURL kycVerified'
        })
        .populate('item', 'title pricePerDay images');
  
      res.json({
        success: true,
        count: bookings.length,
        bookings
      });
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ 
        success: false,
        message: "Error fetching bookings",
        error: error.message
      });
    }
  };

// Get booking by ID
exports.getBookingById = async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId)
            .populate("lenderId", "name email")
            .populate("renterId", "name email")
            .populate("itemId", "title pricePerDay");

        if (!booking) {
            return res.status(404).json({ 
                success: false,
                message: "Booking not found" 
            });
        }

        res.json({
            success: true,
            booking
        });

    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
            error: error.message 
        });
    }
};

// Update booking status
// Update booking status (improved)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, cancellationReason } = req.body;

    // Validate status
    const validStatuses = ["pending", "confirmed", "cancelled", "completed", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status" 
      });
    }

    // Additional business logic checks
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    // Prevent invalid status transitions
    if (booking.status === 'completed' && status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: "Completed bookings cannot be modified"
      });
    }

    // Require cancellation reason for cancellations
    if (status === 'cancelled' && !cancellationReason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required"
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status,
        cancellationReason: status === 'cancelled' ? cancellationReason : undefined,
        updatedAt: Date.now()
      },
      { new: true }
    ).populate(['lender', 'renter', 'item']);

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking: updatedBooking
    });

  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

// Get bookings by user
exports.getUserBookings = async (req, res) => {
  try {
      const { userId } = req.params;

      const bookings = await Booking.find({
          $or: [{ lender: userId }, { renter: userId }] // Changed from lenderId/renterId
      })
      .populate("lender", "name email photoURL kycVerified")
      .populate("renter", "name email photoURL kycVerified")
      .populate("item", "title pricePerDay images");

      res.json({
          success: true,
          count: bookings.length,
          bookings
      });
  } catch (error) {
      console.error("Error fetching user bookings:", error);
      res.status(500).json({ 
          success: false,
          message: "Internal server error",
          error: error.message 
      });
  }
};
// Delete a booking
exports.deleteBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Check if booking exists
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Prevent deletion of confirmed/completed bookings
    if (['confirmed', 'completed'].includes(booking.status)) {
      return res.status(403).json({
        success: false,
        message: `Cannot delete ${booking.status} bookings`
      });
    }

    await Booking.findByIdAndDelete(bookingId);

    res.json({
      success: true,
      message: "Booking deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
// Mark booking as active (item handed over)
exports.markAsActive = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: "Only confirmed bookings can be marked as active"
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'active' },
      { new: true }
    ).populate(['lender', 'renter', 'item']);

    res.json({
      success: true,
      message: "Booking marked as active - item handed over to renter",
      booking: updatedBooking
    });

  } catch (error) {
    console.error("Error marking booking as active:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};

// Mark booking as completed (item returned)
exports.markAsCompleted = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    if (booking.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: "Only active bookings can be marked as completed"
      });
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'completed' },
      { new: true }
    ).populate(['lender', 'renter', 'item']);

    res.json({
      success: true,
      message: "Booking completed - item returned successfully",
      booking: updatedBooking
    });

  } catch (error) {
    console.error("Error marking booking as completed:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
  }
};