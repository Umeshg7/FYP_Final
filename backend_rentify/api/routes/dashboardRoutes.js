const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const KYC = require('../models/KYCSchema');
const Rent = require('../models/Rent');
const User = require('../models/User');
const Report = require('../models/Report');

// Helper function to process monthly data
const processMonthlyData = (data) => {
  const months = Array(12).fill(0).map((_, i) => ({
    _id: i + 1,
    total: 0,
    count: 0
  }));

  data.forEach(item => {
    const monthIndex = item._id - 1;
    months[monthIndex] = item;
  });

  return months;
};

// Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear + 1, 0, 1);

    const [
      totalUsers,
      activeBookings,
      pendingKYCs,
      totalRentItems,
      pendingReports,
      monthlyRevenue,
      bookingsByStatus,
      bookingsByPayment,
      recentBookings,
      kycStatus,
      rentItemsByCategory
    ] = await Promise.all([
      User.countDocuments(),
      Booking.countDocuments({ status: 'active' }),
      KYC.countDocuments({ status: 'PENDING' }),
      Rent.countDocuments({ adminVerified: true }),
      Report.countDocuments({ status: 'pending' }),
      Booking.aggregate([
        {
          $match: {
            status: { $in: ['completed', 'active'] },
            createdAt: { $gte: startOfYear, $lt: endOfYear }
          }
        },
        {
          $group: {
            _id: { $month: '$createdAt' },
            total: { $sum: '$totalPrice' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Booking.aggregate([
        { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
      ]),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('item', 'title')
        .lean(),
      KYC.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Rent.aggregate([
        { $match: { adminVerified: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    // Process KYC status
    const kycStatusMap = {
      APPROVED: 0,
      PENDING: 0,
      REJECTED: 0,
      NEEDS_CORRECTION: 0
    };
    
    kycStatus.forEach(item => {
      kycStatusMap[item._id] = item.count;
    });

    res.json({
      totalUsers,
      activeBookings,
      pendingKYCs,
      totalRentItems,
      pendingReports,
      monthlyRevenue: processMonthlyData(monthlyRevenue),
      bookingsAnalytics: {
        byStatus: bookingsByStatus,
        byPaymentMethod: bookingsByPayment,
        recentBookings
      },
      kycStatus: kycStatusMap,
      rentItemsByCategory
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

module.exports = router;