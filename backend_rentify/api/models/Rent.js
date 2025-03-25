const mongoose = require("mongoose");

const RentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  location: { type: String, required: true },
  images: [{ type: String }],  // Images will be handled later
  userEmail: { type: String, required: true },
  adminVerified: { type: Boolean, default: false }, // Added this field for admin approval
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

module.exports = mongoose.model("Rent", RentSchema);
