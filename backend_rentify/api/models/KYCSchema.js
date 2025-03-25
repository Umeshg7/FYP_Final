const mongoose = require('mongoose');
const { Schema } = mongoose;

const addressSchema = new Schema({
  province: String,
  district: String,
  municipality: String, 
  ward: String
}, { _id: false });

const KYCSchema = new Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  phoneNumber: String,
  documentNumber: {
    type: String,
    default: "Not Given"
  },
  dateOfBirth: Date,
  permanentAddress: addressSchema,
  temporaryAddress: addressSchema,
  documentUrls: [String],
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'NEEDS_CORRECTION'],
    default: 'PENDING'
  },
  adminFeedback: String,
  lastReviewedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('KYC', KYCSchema);