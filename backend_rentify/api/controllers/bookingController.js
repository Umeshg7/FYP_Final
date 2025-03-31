const Booking = require("../models/Booking");
const Rent = require("../models/Rent");
const User = require("../models/User")
const { checkDateAvailability } = require('../../utils/bookingUtils');


    

// Create a new booking

exports.createBooking = async (req, res) => {
  try {
    const { lender, renter, item, startDate, endDate, paymentMethod } = req.body;

    // 1. Validate date range (end date must be after start date)
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date"
      });
    }

    // 2. Check for existing bookings for the same user on the same dates
    const existingUserBooking = await Booking.findOne({
      renter,
      item,
      startDate: { $lt: new Date(endDate) },
      endDate: { $gt: new Date(startDate) },
      status: { $nin: ["cancelled", "rejected"] }
    });

    if (existingUserBooking) {
      return res.status(409).json({
        success: false,
        message: "You already have a booking for these dates"
      });
    }

    // 3. Check general availability
    const isAvailable = await checkDateAvailability(item, startDate, endDate);
    if (!isAvailable) {
      return res.status(409).json({
        success: false,
        message: "The selected dates are not available"
      });
    }

    // 4. Calculate price
    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const itemDetails = await Rent.findById(item);
    const totalPrice = itemDetails.pricePerDay * days;

    // 5. Create booking
    const booking = new Booking({
      lender,
      renter,
      item,
      startDate,
      endDate,
      totalPrice,
      paymentMethod,
      status: "pending"
    });

    await booking.save();

    // 6. Return success response
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
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
exports.updateBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status, cancellationReason } = req.body;

        // Validate status
        const validStatuses = ["confirmed", "cancelled", "completed", "rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid status" 
            });
        }

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                status,
                cancellationReason,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ 
                success: false,
                message: "Booking not found" 
            });
        }

        res.json({
            success: true,
            message: `Booking ${status} successfully`,
            booking
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
            $or: [{ lenderId: userId }, { renterId: userId }]
        })
        .populate("lenderId", "name email")
        .populate("renterId", "name email")
        .populate("itemId", "title pricePerDay");

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