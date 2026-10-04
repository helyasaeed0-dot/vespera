const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product reference is required"],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1 star"],
      max: [5, "Rating cannot exceed 5 stars"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      minlength: [5, "Review comment must be at least 5 characters"],
      maxlength: [1500, "Review comment cannot exceed 1500 characters"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "hidden"],
      default: "pending",
      index: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Synchronize isApproved with status
reviewSchema.pre("save", function (next) {
  this.isApproved = this.status === "approved";
  next();
});

// Static method to recalculate product rating & reviewCount
reviewSchema.statics.calculateAverageRating = async function (productId) {
  try {
    const pId = new mongoose.Types.ObjectId(productId);
    const stats = await this.aggregate([
      { $match: { product: pId, status: "approved" } },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await mongoose.model("Product").findByIdAndUpdate(pId, {
        rating: Math.round(stats[0].avgRating * 10) / 10,
        reviewCount: stats[0].reviewCount,
      });
    } else {
      await mongoose.model("Product").findByIdAndUpdate(pId, {
        rating: 5.0,
        reviewCount: 0,
      });
    }
  } catch (err) {
    console.error("Error calculating average product rating:", err);
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.product);
});

reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.product);
  }
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.product);
  }
});

module.exports = mongoose.model("Review", reviewSchema);
