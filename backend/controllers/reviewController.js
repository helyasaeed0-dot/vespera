const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// Helper to resolve product by ObjectId or Slug
const resolveProduct = async (identifier) => {
  if (!identifier) return null;
  if (mongoose.Types.ObjectId.isValid(identifier)) {
    const product = await Product.findById(identifier);
    if (product) return product;
  }
  return await Product.findOne({ slug: String(identifier).toLowerCase() });
};

// @desc    Get public approved reviews for a product (by ID or Slug)
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = async (req, res) => {
  const { productId } = req.params;
  const product = await resolveProduct(productId);

  if (!product) {
    return sendError(res, "Product not found", 404);
  }

  // Only approved reviews are public
  const reviews = await Review.find({
    product: product._id,
    status: "approved",
  })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });

  // Calculate dynamic rating breakdown
  const ratingBreakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let ratingSum = 0;

  reviews.forEach((rev) => {
    const r = Math.round(rev.rating);
    if (ratingBreakdown[r] !== undefined) {
      ratingBreakdown[r] += 1;
    }
    ratingSum += rev.rating;
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0 ? Math.round((ratingSum / totalReviews) * 10) / 10 : 5.0;

  return sendSuccess(res, "Product reviews fetched successfully", {
    reviews,
    totalReviews,
    averageRating,
    ratingBreakdown,
    productId: product._id,
    productSlug: product.slug,
  });
};

// @desc    Check if current authenticated user is eligible to review the product
// @route   GET /api/reviews/product/:productId/eligibility
// @access  Private (Authenticated User)
const checkReviewEligibility = async (req, res) => {
  const { productId } = req.params;
  const product = await resolveProduct(productId);

  if (!product) {
    return sendError(res, "Product not found", 404);
  }

  const userId = req.user._id || req.user.id;

  // 1. Check if user already reviewed this product
  const existingReview = await Review.findOne({
    product: product._id,
    user: userId,
  });

  // 2. Find eligible verified purchase order
  // Order must belong to user, contain the product, and be paid/delivered/shipped/processing
  const verifiedOrder = await Order.findOne({
    user: userId,
    $or: [
      { "orderItems.product": product._id },
      { "orderItems.slug": product.slug },
      { "orderItems.title": product.title },
    ],
    $and: [
      { orderStatus: { $nin: ["Cancelled"] } },
      { paymentStatus: { $nin: ["Failed", "Refunded"] } },
      {
        $or: [
          { paymentStatus: "Paid" },
          { orderStatus: { $in: ["Delivered", "Shipped", "Processing"] } },
        ],
      },
    ],
  }).sort({ createdAt: -1 });

  const hasPurchased = Boolean(verifiedOrder);
  const canReview = hasPurchased && !existingReview;

  return sendSuccess(res, "Eligibility checked", {
    canReview,
    hasPurchased,
    alreadyReviewed: Boolean(existingReview),
    existingReview: existingReview || null,
    verifiedOrderId: verifiedOrder?._id || null,
    orderIdString: verifiedOrder?.orderId || null,
  });
};

// @desc    Create a product review (Only verified purchased users)
// @route   POST /api/reviews
// @access  Private (Authenticated User)
const createReview = async (req, res) => {
  const productId = req.body.productId || req.params.productId;
  const { rating, comment } = req.body;

  if (!productId) {
    return sendError(res, "Product ID or slug is required", 400);
  }

  const numericRating = Number(rating);
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    return sendError(res, "Please provide a valid rating between 1 and 5 stars", 400);
  }

  if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
    return sendError(res, "Review comment must be at least 5 characters long", 400);
  }

  if (comment.trim().length > 1500) {
    return sendError(res, "Review comment cannot exceed 1500 characters", 400);
  }

  const product = await resolveProduct(productId);
  if (!product) {
    return sendError(res, "Product not found", 404);
  }

  const userId = req.user._id || req.user.id;

  // 1. Verify Purchase in Order collection
  const verifiedOrder = await Order.findOne({
    user: userId,
    $or: [
      { "orderItems.product": product._id },
      { "orderItems.slug": product.slug },
      { "orderItems.title": product.title },
    ],
    $and: [
      { orderStatus: { $nin: ["Cancelled"] } },
      { paymentStatus: { $nin: ["Failed", "Refunded"] } },
      {
        $or: [
          { paymentStatus: "Paid" },
          { orderStatus: { $in: ["Delivered", "Shipped", "Processing"] } },
        ],
      },
    ],
  }).sort({ createdAt: -1 });

  if (!verifiedOrder) {
    return sendError(
      res,
      "Only customers who have purchased and received this product can submit a review.",
      403
    );
  }

  // 2. Check if user already submitted a review for this product
  const existingReview = await Review.findOne({
    product: product._id,
    user: userId,
  });

  if (existingReview) {
    return sendError(
      res,
      "You have already submitted a review for this product. You may edit your existing review instead.",
      409
    );
  }

  // 3. Create Review in pending status
  const review = await Review.create({
    product: product._id,
    user: userId,
    order: verifiedOrder._id,
    userName: req.user.name || "Verified Customer",
    userEmail: req.user.email || "",
    rating: numericRating,
    comment: comment.trim(),
    status: "pending",
    isApproved: false,
  });

  return sendSuccess(
    res,
    "Thank you! Your review has been submitted and is awaiting approval.",
    { review },
    201
  );
};

// @desc    Update own review
// @route   PUT /api/reviews/:id
// @access  Private (Owner or Admin)
const updateReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(id);
  if (!review) {
    return sendError(res, "Review not found", 404);
  }

  const userId = req.user._id ? req.user._id.toString() : req.user.id;
  const isOwner = review.user.toString() === userId;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return sendError(res, "You are not authorized to update this review", 403);
  }

  if (rating !== undefined) {
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return sendError(res, "Rating must be between 1 and 5", 400);
    }
    review.rating = numRating;
  }

  if (comment !== undefined) {
    if (typeof comment !== "string" || comment.trim().length < 5) {
      return sendError(res, "Comment must be at least 5 characters", 400);
    }
    review.comment = comment.trim();
  }

  // If regular user edits review, send back to pending for re-moderation
  if (!isAdmin) {
    review.status = "pending";
    review.isApproved = false;
  }

  await review.save();
  await Review.calculateAverageRating(review.product);

  return sendSuccess(
    res,
    isAdmin
      ? "Review updated successfully"
      : "Your review has been updated and is awaiting re-moderation.",
    { review }
  );
};

// @desc    Delete own review (or Admin delete)
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);

  if (!review) {
    return sendError(res, "Review not found", 404);
  }

  const userId = req.user._id ? req.user._id.toString() : req.user.id;
  const isOwner = review.user.toString() === userId;
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return sendError(res, "Not authorized to delete this review", 403);
  }

  const productId = review.product;
  await Review.findByIdAndDelete(id);
  await Review.calculateAverageRating(productId);

  return sendSuccess(res, "Review deleted successfully");
};

// @desc    Approve/Hide/Pending status update (Admin)
// @route   PATCH /api/reviews/:id/status
// @access  Private (Admin)
const updateReviewStatus = async (req, res) => {
  const { id } = req.params;
  const { status, isApproved } = req.body;

  let newStatus = status;
  if (!newStatus && isApproved !== undefined) {
    newStatus = isApproved ? "approved" : "hidden";
  }

  if (!["pending", "approved", "hidden"].includes(newStatus)) {
    return sendError(res, "Invalid status. Must be pending, approved, or hidden", 400);
  }

  const review = await Review.findByIdAndUpdate(
    id,
    {
      status: newStatus,
      isApproved: newStatus === "approved",
    },
    { new: true }
  );

  if (!review) {
    return sendError(res, "Review not found", 404);
  }

  await Review.calculateAverageRating(review.product);

  return sendSuccess(res, `Review marked as ${newStatus}`, { review });
};

module.exports = {
  getProductReviews,
  checkReviewEligibility,
  createReview,
  updateReview,
  deleteReview,
  updateReviewStatus,
};
