const express = require("express");
const router = express.Router();

const {
  submitReport,
  getAllReports,
  updateReportStatus,
} = require("../controllers/report");

// User route to submit a report
router.post("/", submitReport);

// Admin routes
router.get("/", getAllReports);
router.patch("/:id/status", updateReportStatus);

module.exports = router;
