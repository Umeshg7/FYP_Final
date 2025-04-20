const mongoose = require("mongoose");

const RentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  location: {  // GeoJSON format
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true
    },
    address: { type: String }  // Human-readable address (optional)
  },
  images: [{ type: String }],
  userEmail: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  adminVerified: { type: Boolean, default: false }  // Default to false for admin approval
}, { timestamps: true });

// Geospatial index for proximity searches
RentSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Rent", RentSchema);