const Booking = require("../models/Booking");
const Rent = require("../models/Rent");

// Helper function to check date availability
const checkDateAvailability = async (itemId, startDate, endDate, excludeBookingId = null) => {
    const query = {
        itemId,
        $or: [
            {
                startDate: { $lt: new Date(endDate) },
                endDate: { $gt: new Date(startDate) }
            }
        ],
        status: { $in: ["confirmed", "pending"] }
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    const conflictingBookings = await Booking.find(query);
    return conflictingBookings.length === 0;
};

// Create a new booking
exports.createBooking = async (req, res) => {
    try {
        const { lenderId, renterId, itemId, startDate, endDate, paymentMethod } = req.body;

        // Validate input
        if (!lenderId || !renterId || !itemId || !startDate || !endDate) {
            return res.status(400).json({ 
                success: false,
                message: "Missing required fields" 
            });
        }

        // Check if the item exists
        const item = await Rent.findById(itemId);
        if (!item) {
            return res.status(404).json({ 
                success: false,
                message: "Item not found" 
            });
        }

        // Check availability
        const isAvailable = await checkDateAvailability(itemId, startDate, endDate);
        if (!isAvailable) {
            return res.status(409).json({ 
                success: false,
                message: "The selected dates are not available" 
            });
        }

        // Calculate total price based on days
        const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
        const totalPrice = item.pricePerDay * days;

        // Create the booking
        const booking = new Booking({
            lenderId,
            renterId,
            itemId,
            startDate,
            endDate,
            totalPrice,
            paymentMethod,
            status: paymentMethod ? "pending" : "confirmed"
        });

        await booking.save();

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
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("lenderId", "name email")
            .populate("renterId", "name email")
            .populate("itemId", "title pricePerDay");

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ 
            success: false,
            message: "Internal server error",
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