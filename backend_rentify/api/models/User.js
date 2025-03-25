const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true, // Creates unique index automatically
    trim: true,
    lowercase: true
  },
  kycId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'KYC' 
  },
  photoURL: String,
  phoneNumber: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  kycVerified: {
    type: Boolean,
    default: false,
    index: true // Helps query verified users faster
  },
  phoneVerified: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);