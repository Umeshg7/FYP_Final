const express = require("express");
const router = express.Router();
const KYCController = require("../controllers/KYCController");


// Create a new KYC record
router.post("/", KYCController.createKYC);

// Update KYC verification status
router.put("/:id/verify", KYCController.updateVerificationStatus);

// Get KYC data by email
router.get("/:email", KYCController.getKYCByEmail);

// Get all KYC records (for admin)
router.get("/", KYCController.getAllKYCs);

module.exports = router;
