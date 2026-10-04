const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Career",
      required: [true, "Job reference is required"],
      index: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      default: "",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Applicant full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Applicant email is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, "Applicant phone number is required"],
      trim: true,
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
    },
    resumeUrl: {
      type: String,
      required: [true, "Resume / CV document URL is required"],
    },
    resumePublicId: {
      type: String,
      default: "",
    },
    resumeName: {
      type: String,
      default: "Resume.pdf",
    },
    coverLetter: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewing", "Shortlisted", "Rejected", "Hired"],
      default: "Pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

jobApplicationSchema.index({ email: 1, job: 1 });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
