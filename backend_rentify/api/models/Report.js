const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ["lost", "payment", "damage", "user", "other"] 
  },
  images: { type: [String], required: true },
  status: { 
    type: String, 
    enum: ["pending", "resolved", "rejected"], 
    default: "pending" 
  },
  reportedBy: {
    email: { type: String, required: true },
    name: { type: String },
    uid: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Report", ReportSchema);
