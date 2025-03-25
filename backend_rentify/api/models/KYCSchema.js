const mongoose = require("mongoose");

const KYCSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    email: String,
    phoneNumber: String,
    dateOfBirth: Date,
    permanentAddress: {
      province: String,
      district: String,
      ward: String,
    },
    temporaryAddress: {
      province: String,
      district: String,
      ward: String,
    },
    documentUrl: String,
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("KYC", KYCSchema);
