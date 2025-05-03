const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  userId: { 
    type: String, 
    ref: "User", 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  link: String,
  type: {
    type: String,
    enum: ["booking", "message", "system", "payment"],
    required: true
  },
  relatedBooking: {
    type: Schema.Types.ObjectId,
    ref: "Booking"
  },
  relatedItem: {
    type: Schema.Types.ObjectId,
    ref: "Rent"
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);