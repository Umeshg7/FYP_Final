// models/Booking.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  lender: { 
    type: String, 
    ref: "User", 
    required: true 
  },
  renter: { 
    type: String, 
    ref: "User", 
    required: true 
  },
  item: { 
    type: Schema.Types.ObjectId, 
    ref: "Rent", 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "active", "completed", "cancelled", "rejected"], 
    default: "pending" 
  },
  totalPrice: { 
    type: Number, 
    required: true 
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "esewa"], // Add "esewa" to the enum values
    required: true
  },
  cancellationReason: {
    type: String, 
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);