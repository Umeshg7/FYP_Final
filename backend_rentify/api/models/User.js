const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  email: {
    type: String,
    trim: true,
    minlength: 3,
  },
  photoURL: String,
  ContactNo: {
    type: String, // Changed to String to handle country codes
    default: "+1234567890",
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  kycVerified: {
    type: Boolean,
    default: false,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  otp: String,
  otpExpires: Date
});

const User = mongoose.model('User', userSchema);
module.exports = User;