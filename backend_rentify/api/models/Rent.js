const mongoose = require("mongoose");

const RentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  location: { type: String, required: true },
  images: [{ type: String }],
  userEmail: { type: String, required: true },
  userId: { type: String, required: true },       // Added user ID
  userName: { type: String, required: true },     // Added user name
  adminVerified: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Rent", RentSchema);