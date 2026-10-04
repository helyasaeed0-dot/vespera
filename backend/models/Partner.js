const mongoose = require("mongoose");

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Partner / program title is required"],
      trim: true,
    },
    partner: {
      type: String,
      default: "",
      trim: true,
    },
    company: {
      type: String,
      default: "",
      trim: true,
    },
    logo: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    summary: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    date: {
      type: String,
      default: function () {
        return new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Partner", partnerSchema);
