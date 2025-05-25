const Booking = require("../models/Booking");
const Rent = require("../models/Rent");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { checkDateAvailability } = require('../../utils/bookingUtils');
const nodemailer = require("nodemailer");
const { transporter } = require('../../utils/email');
const mongoose = require('mongoose');

// Helper function to create notifications
async function createNotification(userId, message, type, link, relatedBooking, relatedItem) {
  try {
    const notification = new Notification({
      userId,
      message,
      type,
      link: link || null,
      relatedBooking: relatedBooking || null,
      relatedItem: relatedItem || null,
    });
    await notification.save();
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

// Helper function to update item's average rating
async function updateItemAverageRating(itemId) {
  try {
    const result = await Booking.aggregate([
      {
        $match: {
          item: new mongoose.Types.ObjectId(itemId),
          'review.rating': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$item',
          averageRating: { $avg: '$review.rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    if (result.length > 0) {
      await Rent.findByIdAndUpdate(itemId, {
        averageRating: parseFloat(result[0].averageRating.toFixed(1)),
        reviewCount: result[0].reviewCount
      });
    }
  } catch (error) {
    console.error("Error updating item rating:", error);
    throw error;
  }
}

// Email sending functions
const sendBookingEmail = async ({ to, bookingId, startDate, endDate, totalPrice }) => {
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
          <p><strong>Total Price:</strong> NPR: ${totalPrice}</p>
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

const sendCompletionEmail = async (booking) => {
  const mailOptions = {
    from: `"Rental App" <${process.env.GMAIL_USER}>`,
    to: [booking.lender.email, booking.renter.email],
    subject: "✅ Booking Completed!",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6b46c1;">Booking Completed!</h2>
        <p>Your rental period has ended. Please leave a review:</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p><strong>Item:</strong> ${booking.item.title}</p>
          <p><strong>Rental Period:</strong> ${booking.startDate.toLocaleDateString()} to ${booking.endDate.toLocaleDateString()}</p>
        </div>
        <a href="http://localhost:5173/user-dashboard/lent" 
           style="display: inline-block; background: #6b46c1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Leave a Review
        </a>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { lender, lenderEmail, renter, item, startDate, endDate, paymentMethod } = req.body;

    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ error: "End date must be after start date" });
    }

    const isAvailable = await checkDateAvailability(item, startDate, endDate);
    if (!isAvailable) {
      return res.status(409).json({ error: "Selected dates are not available" });
    }

    const itemDetails = await Rent.findById(item);
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalPrice = itemDetails.pricePerDay * days;

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

    // Send notifications
    await createNotification(
      lender,
      `New booking request for ${itemDetails.title}`,
      "booking",
      `/bookings/${booking._id}`,
      booking._id,
      item
    );

    await createNotification(
      renter,
      `You requested to book ${itemDetails.title}`,
      "booking",
      `/bookings/${booking._id}`,
      booking._id,
      item
    );

    sendBookingEmail({
      to: lenderEmail,
      bookingId: booking._id,
      startDate,
      endDate,
      totalPrice,
    }).catch(err => console.error("Email error:", err));

    res.status(201).json({ success: true, booking });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Server error" });
  }
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
      .populate({
        path: 'item',
        select: 'title pricePerDay images averageRating reviewCount'
      });

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
      .populate("lender", "name email photoURL")
      .populate("renter", "name email photoURL")
      .populate({
        path: "item",
        select: "title pricePerDay images averageRating reviewCount"
      });

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
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, cancellationReason } = req.body;

    const validStatuses = ["pending", "payment_pending", "confirmed", "active", "completed", "cancelled", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status" 
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: "Booking not found" 
      });
    }

    const allowedTransitions = {
      pending: ['payment_pending', 'confirmed', 'rejected', 'cancelled'],
      payment_pending: ['confirmed', 'cancelled'],
      confirmed: ['active', 'cancelled'],
      active: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      rejected: []
    };

    if (!allowedTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${booking.status} to ${status}`
      });
    }

    if (['cancelled', 'rejected'].includes(status) && !cancellationReason?.trim()) {
      return res.status(400).json({
        success: false,
        message: `${status} reason is required`
      });
    }

    const updateData = {
      status,
      ...(['cancelled', 'rejected'].includes(status) && { cancellationReason }),
      updatedAt: Date.now()
    };

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true }
    ).populate(['lender', 'renter', 'item']);

    // Create notifications for both parties
    const statusMessages = {
      payment_pending: {
        lender: `Your booking request for ${updatedBooking.item.title} is awaiting payment`,
        renter: `New booking request for ${updatedBooking.item.title} - awaiting payment`
      },
      confirmed: {
        lender: `Your booking for ${updatedBooking.item.title} has been confirmed!`,
        renter: `Booking confirmed for ${updatedBooking.item.title}`
      },
      active: {
        lender: `Your rental of ${updatedBooking.item.title} is now active`,
        renter: `Rental period for ${updatedBooking.item.title} has started`
      },
      completed: {
        lender: `Your rental of ${updatedBooking.item.title} has been completed`,
        renter: `Rental period for ${updatedBooking.item.title} has ended`
      },
      cancelled: {
        lender: `Your booking for ${updatedBooking.item.title} has been cancelled`,
        renter: `Booking cancelled for ${updatedBooking.item.title}`
      },
      rejected: {
        lender: `Your booking request for ${updatedBooking.item.title} was rejected`,
        renter: `Booking request rejected for ${updatedBooking.item.title}`
      }
    };

    if (statusMessages[status]) {
      // Lender notification
      await createNotification(
        updatedBooking.lender._id,
        statusMessages[status].lender,
        "booking",
        `/user-dashboard/lent`,
        bookingId,
        updatedBooking.item._id
      );

      // Renter notification
      await createNotification(
        updatedBooking.renter._id,
        statusMessages[status].renter,
        "booking",
        `/user-dashboard/lent`,
        bookingId,
        updatedBooking.item._id
      );
    }

    if (status === 'completed') {
      sendCompletionEmail(updatedBooking).catch(console.error);
    }

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
      $or: [{ lender: userId }, { renter: userId }]
    })
    .populate("lender", "name email photoURL kycVerified")
    .populate("renter", "name email photoURL kycVerified")
    .populate({
      path: "item",
      select: "title pricePerDay images averageRating reviewCount"
    });

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

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

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

// Mark booking as active
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

    // Send notifications
    await createNotification(
      updatedBooking.lender._id,
      `Your rental of ${updatedBooking.item.title} is now active`,
      "booking",
      `/user-dashboard/lent`,
      bookingId,
      updatedBooking.item._id
    );

    await createNotification(
      updatedBooking.renter._id,
      `Rental period for ${updatedBooking.item.title} has started`,
      "booking",
      `/user-dashboard/lent`,
      bookingId,
      updatedBooking.item._id
    );

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

// Mark booking as completed
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

    // Send notifications
    await createNotification(
      updatedBooking.lender._id,
      `Your rental of ${updatedBooking.item.title} has been completed`,
      "booking",
      `/user-dashboard/lent`,
      bookingId,
      updatedBooking.item._id
    );

    await createNotification(
      updatedBooking.renter._id,
      `Rental period for ${updatedBooking.item.title} has ended`,
      "booking",
      `/user-dashboard/lent`,
      bookingId,
      updatedBooking.item._id
    );

    sendCompletionEmail(updatedBooking).catch(console.error);

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

// Submit a review for a booking
exports.submitReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, comment, reviewerRole } = req.body;

    if (!reviewerRole || !['lender', 'renter'].includes(reviewerRole)) {
      return res.status(400).json({
        success: false,
        message: "Reviewer role is required (must be 'lender' or 'renter')"
      });
    }

    if (typeof rating !== 'number' || isNaN(rating)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a valid number",
        received: rating
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
        received: rating
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: "Only completed bookings can be reviewed"
      });
    }

    booking.review = {
      rating: Math.round(rating),
      comment: comment || '',
      createdAt: new Date(),
      reviewerRole
    };

    await booking.save();
    await updateItemAverageRating(booking.item);

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: booking.review
    });

  } catch (error) {
    console.error('Review error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get reviews for an item
exports.getItemReviews = async (req, res) => {
  try {
    const { itemId } = req.params;

    const reviews = await Booking.find({
      item: itemId,
      status: 'completed',
      'review.rating': { $exists: true }
    })
    .populate('renter', 'name photoURL')
    .select('review startDate endDate renter')
    .sort({ 'review.createdAt': -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews: reviews.map(r => ({
        rating: r.review.rating,
        comment: r.review.comment,
        date: r.review.createdAt,
        renter: r.renter,
        rentalPeriod: {
          startDate: r.startDate,
          endDate: r.endDate
        }
      }))
    });

  } catch (error) {
    console.error("Error fetching item reviews:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};