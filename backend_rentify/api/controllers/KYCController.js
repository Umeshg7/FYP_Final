const KYC = require("../models/KYCSchema");

// Create or update KYC record
exports.createOrUpdateKYC = async (req, res) => {
  try {
    const { email } = req.body;
    const kycData = {
      ...req.body,
      status: req.body.status || 'PENDING', // Allow status override for updates
      lastReviewedAt: null,
      updatedAt: new Date()
    };

    // Check if KYC exists for this email
    const existingKYC = await KYC.findOne({ email });

    let savedKYC;
    if (existingKYC) {
      // Update existing record (for NEEDS_CORRECTION cases)
      if (existingKYC.status === 'NEEDS_CORRECTION') {
        savedKYC = await KYC.findOneAndUpdate(
          { email },
          kycData,
          { new: true, runValidators: true }
        );
      } else {
        return res.status(400).json({
          success: false,
          message: "KYC already exists with status: " + existingKYC.status
        });
      }
    } else {
      // Create new record
      savedKYC = await KYC.create(kycData);
    }

    return res.status(200).json({
      success: true,
      message: existingKYC ? "KYC updated successfully" : "KYC submitted successfully",
      data: savedKYC
    });

  } catch (error) {
    console.error("Error processing KYC:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate key error - email already exists"
      });
    }
    return res.status(500).json({
      success: false,
      message: "Server error processing KYC"
    });
  }
};

// Update KYC status by email (with admin feedback)
exports.updateKYCStatusByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const { status, adminFeedback } = req.body;
    
    // Validate status
    if (!['APPROVED', 'REJECTED', 'NEEDS_CORRECTION', 'PENDING'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const updateData = {
      status,
      lastReviewedAt: new Date(),
      updatedAt: new Date()
    };
    
    if (adminFeedback) updateData.adminFeedback = adminFeedback;
    
    // Update KYC
    const updatedKYC = await KYC.findOneAndUpdate(
      { email }, 
      updateData, 
      { new: true, runValidators: true }
    );

    if (!updatedKYC) {
      return res.status(404).json({ 
        success: false,
        message: "KYC record not found for this email" 
      });
    }

    // ⭐ Auto-update User if KYC is approved
    if (status === 'APPROVED') {
      await User.findOneAndUpdate(
        { email },
        { 
          kycVerified: true,
          kycId: updatedKYC._id, // Link KYC document to User
          phoneNumber: updatedKYC.phoneNumber // Optional: Sync phone
        },
        { new: true }
      );
    }

    // ⭐ Optional: If rejected, mark user as unverified
    if (status === 'REJECTED') {
      await User.findOneAndUpdate(
        { email },
        { kycVerified: false }
      );
    }

    return res.status(200).json({
      success: true,
      message: `KYC status updated to ${status}`,
      data: updatedKYC
    });
  } catch (error) {
    console.error("Error updating KYC status:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error updating KYC" 
    });
  }
};

// Get KYC by email
exports.getKYCByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const kycRecord = await KYC.findOne({ email });

    if (!kycRecord) {
      return res.status(404).json({ 
        success: false,
        message: "KYC record not found" 
      });
    }

    return res.status(200).json({ 
      success: true,
      data: kycRecord 
    });
  } catch (error) {
    console.error("Error fetching KYC by email:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error fetching KYC" 
    });
  }
};

// Get KYC status summary by email
exports.getKYCStatusByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const kycRecord = await KYC.findOne({ email }, 'status adminFeedback lastReviewedAt createdAt updatedAt');

    if (!kycRecord) {
      return res.status(404).json({ 
        success: false,
        message: "KYC record not found" 
      });
    }

    return res.status(200).json({ 
      success: true,
      data: {
        status: kycRecord.status,
        adminFeedback: kycRecord.adminFeedback,
        lastReviewedAt: kycRecord.lastReviewedAt,
        createdAt: kycRecord.createdAt,
        updatedAt: kycRecord.updatedAt
      }
    });
  } catch (error) {
    console.error("Error fetching KYC status:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error fetching KYC status" 
    });
  }
};

// Get all KYC records with filtering
exports.getAllKYCs = async (req, res) => {
  try {
    const { status, email, search } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (email) filter.email = { $regex: email, $options: 'i' };
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const kycRecords = await KYC.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: kycRecords.length,
      data: kycRecords
    });
  } catch (error) {
    console.error("Error fetching all KYCs:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error fetching KYCs" 
    });
  }
};

// Get KYC statistics
exports.getKYCStats = async (req, res) => {
  try {
    const stats = await KYC.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { status: 1 }
      }
    ]);

    // Get total count
    const total = await KYC.countDocuments();

    return res.status(200).json({
      success: true,
      data: {
        stats,
        total
      }
    });
  } catch (error) {
    console.error("Error fetching KYC stats:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error fetching stats" 
    });
  }
};

// Delete KYC by email
exports.deleteKYCByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const deletedKYC = await KYC.findOneAndDelete({ email });

    if (!deletedKYC) {
      return res.status(404).json({ 
        success: false,
        message: "KYC record not found" 
      });
    }

    return res.status(200).json({
      success: true,
      message: "KYC record deleted successfully",
      data: deletedKYC
    });
  } catch (error) {
    console.error("Error deleting KYC:", error);
    return res.status(500).json({ 
      success: false,
      message: "Server error deleting KYC" 
    });
  }
};