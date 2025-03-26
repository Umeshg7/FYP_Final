const KYC = require("../models/KYCSchema");
const User = require("../models/User");

const KYC_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  NEEDS_CORRECTION: 'NEEDS_CORRECTION'
};

// Create or update KYC
exports.createOrUpdateKYC = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const kycData = {
      ...req.body,
      userId,
      email: req.body.email.toLowerCase(),
      status: req.body.status || KYC_STATUS.PENDING,
      lastReviewedAt: null
    };

    const existingKYC = await KYC.findOne({ userId });

    if (existingKYC) {
      if (existingKYC.status !== KYC_STATUS.NEEDS_CORRECTION) {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot modify KYC with status: ${existingKYC.status}` 
        });
      }
      
      const updatedKYC = await KYC.findOneAndUpdate({ userId }, kycData, { new: true });
      return res.json({ success: true, message: "KYC updated", data: updatedKYC });
    }

    const newKYC = await KYC.create(kycData);
    await User.findByIdAndUpdate(userId, { kycId: newKYC._id });
    
    return res.status(201).json({ success: true, message: "KYC created", data: newKYC });

  } catch (error) {
    console.error("KYC Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update KYC status by userId
exports.updateKYCStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, adminFeedback } = req.body;

    if (!Object.values(KYC_STATUS).includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const update = { 
      status, 
      lastReviewedAt: new Date(),
      ...(adminFeedback && { adminFeedback })
    };

    const kyc = await KYC.findOneAndUpdate({ userId }, update, { new: true });
    if (!kyc) return res.status(404).json({ success: false, message: "KYC not found" });

    // Update user verification status
    if (status === KYC_STATUS.APPROVED) {
      await User.findByIdAndUpdate(
        userId,
        { 
          kycVerified: true,
          kycId: kyc._id,
          phoneNumber: kyc.phoneNumber
        }
      );
    } else if (status === KYC_STATUS.REJECTED) {
      await User.findByIdAndUpdate(
        userId,
        { kycVerified: false }
      );
    }

    return res.json({ success: true, message: `KYC ${status}`, data: kyc });

  } catch (error) {
    console.error("Status Update Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all KYCs (without pagination)
exports.getAllKYCs = async (req, res) => {
  try {
    const { status, userId, search } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const kycs = await KYC.find(filter).sort({ createdAt: -1 });
    
    return res.json({ 
      success: true, 
      data: kycs 
    });
  } catch (error) {
    console.error("Fetch KYCs Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error fetching KYCs" 
    });
  }
};

// Get KYC by user
exports.getKYCByUser = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ userId: req.params.userId });
    if (!kyc) return res.status(404).json({ success: false, message: "KYC not found" });
    return res.json({ success: true, data: kyc });
  } catch (error) {
    console.error("Get KYC Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get KYC status only
exports.getKYCStatus = async (req, res) => {
  try {
    const kyc = await KYC.findOne(
      { userId: req.params.userId },
      'status adminFeedback lastReviewedAt createdAt updatedAt'
    );
    
    if (!kyc) return res.status(404).json({ success: false, message: "KYC not found" });
    
    return res.json({ 
      success: true, 
      data: {
        status: kyc.status,
        adminFeedback: kyc.adminFeedback || 'No feedback',
        lastReviewedAt: kyc.lastReviewedAt,
        createdAt: kyc.createdAt,
        updatedAt: kyc.updatedAt
      }
    });
  } catch (error) {
    console.error("Status Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete KYC
exports.deleteKYC = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const deletedKYC = await KYC.findOneAndDelete({ userId });
    if (!deletedKYC) return res.status(404).json({ success: false, message: "KYC not found" });

    await User.findByIdAndUpdate(userId, { kycVerified: false, $unset: { kycId: "" } });
    
    return res.json({ success: true, message: "KYC deleted", data: deletedKYC });
  } catch (error) {
    console.error("Delete Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};