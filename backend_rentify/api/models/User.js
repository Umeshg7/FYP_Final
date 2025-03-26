const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  _id: String, // This will store the Firebase UID
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
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
    index: true
  },
  phoneVerified: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true,
  _id: false // This tells Mongoose not to auto-generate an _id
});

module.exports = mongoose.model('User', userSchema);