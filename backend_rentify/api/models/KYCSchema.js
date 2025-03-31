const mongoose = require('mongoose');
const { Schema } = mongoose;
const addressSchema = new Schema({
  province: String,
  district: String,
  municipality: String, 
  ward: String
}, { _id: false });

const KYCSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { 
    type: String, 
    required: true,
    match: [/.+\@.+\..+/, 'Please enter a valid email'],
    lowercase: true
  },
  phoneNumber: { type: String, required: true },
  photoUrls: {
    type: [String],
    required: true
  },
  userId: { 
    type: String,  // Changed from ObjectId to String
    required: true, 
    unique: true 
  },
  documentNumber: {
    type: String,
    required: true
  },
  dateOfBirth: { type: Date, required: true },
  permanentAddress: { type: addressSchema, required: true },
  temporaryAddress: addressSchema,
  documentUrls: {
    type: [String],
    validate: [arrayLimit, 'Must have at least 1 document'],
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION'],
    default: 'PENDING'
  },
  adminFeedback: String,
  lastReviewedAt: Date
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// Validate documentUrls array has at least 1 item
function arrayLimit(val) {
  return val.length >= 1;
}

module.exports = mongoose.model('KYC', KYCSchema);