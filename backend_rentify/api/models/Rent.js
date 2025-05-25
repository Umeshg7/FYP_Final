const mongoose = require("mongoose");

const RentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  pricePerDay: { type: Number, required: true },
  location: { 
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number],  
      required: true
    },
    address: { type: String }  
  },
  images: [{ type: String }],
  userEmail: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  adminVerified: { type: Boolean, default: true }  
}, { timestamps: true });


RentSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Rent", RentSchema);