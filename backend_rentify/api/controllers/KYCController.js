const KYC = require("../models/KYCSchema");

// Create new KYC record
exports.createKYC = async (req, res) => {
  try {
    const kycData = new KYC(req.body); // Directly use request body
    const savedKYC = await kycData.save(); // Save to database

    return res.status(201).json({ message: "KYC record created successfully", savedKYC });
  } catch (error) {
    console.error("Error creating KYC:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update KYC verification status
exports.updateVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    const updatedKYC = await KYC.findByIdAndUpdate(id, { verified }, { new: true });

    if (!updatedKYC) return res.status(404).json({ message: "KYC record not found" });

    return res.status(200).json({
      message: `KYC record ${verified ? "verified" : "unverified"} successfully`,
      updatedKYC,
    });
  } catch (error) {
    console.error("Error updating verification status:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get KYC data by email
exports.getKYCByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const kycRecord = await KYC.findOne({ email });

    if (!kycRecord) return res.status(404).json({ message: "KYC record not found" });

    return res.status(200).json({ kycRecord });
  } catch (error) {
    console.error("Error fetching KYC:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all KYC records
exports.getAllKYCs = async (req, res) => {
  try {
    const kycRecords = await KYC.find();
    return res.status(200).json({ kycRecords });
  } catch (error) {
    console.error("Error fetching all KYCs:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
