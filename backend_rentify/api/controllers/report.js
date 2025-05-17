const Report = require("../models/Report");

// Submit a new report
const submitReport = async (req, res, next) => {
  try {
    const { title, description, category, images, reportedBy } = req.body;

    const newReport = new Report({
      title,
      description,
      category,
      images,
      reportedBy,
    });

    await newReport.save();
    res.status(201).json(newReport);
  } catch (err) {
    next(err);
  }
};

// Get all reports (admin)
const getAllReports = async (req, res, next) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    next(err);
  }
};

// Update report status (admin)
const updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const report = await Report.findByIdAndUpdate(id, { status }, { new: true });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json(report);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  submitReport,
  getAllReports,
  updateReportStatus,
};
