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
    enum: ["pending", "payment_pending", "confirmed", "active", "completed", "cancelled", "rejected"], 
    default: "pending" 
  },
  totalPrice: { 
    type: Number, 
    required: true 
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "esewa"],
    required: true
  },
  paymentDetails: {
    type: Object,
    default: null
  },
  cancellationReason: {
    type: String, 
    default: null
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    comment: {
      type: String,
      default: null,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: null
    },
    reviewerRole: {
      type: String,
      enum: ["lender", "renter"],
      default: null
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);