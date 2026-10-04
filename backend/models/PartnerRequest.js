const mongoose = require("mongoose");

const partnerRequestSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    contactName: {
      type: String,
      required: [true, "Contact officer name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Corporate email is required"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    partnershipType: {
      type: String,
      default: "MOU",
      trim: true,
    },
    message: {
      type: String,
      required: [true, "Proposal brief is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Approved", "Rejected"],
      default: "Pending",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PartnerRequest", partnerRequestSchema);
