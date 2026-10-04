const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Career = require("../models/Career");
const JobApplication = require("../models/JobApplication");
const Partner = require("../models/Partner");
const Review = require("../models/Review");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Get Admin Dashboard Overview Statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  const [
    totalUsers,
    activeUsers,
    totalProducts,
    featuredProducts,
    totalOrders,
    pendingOrders,
    paidOrders,
    revenueStats,
    totalApplications,
    activeJobs,
    totalPartners,
    totalReviews,
    pendingReviews,
    recentOrders,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Product.countDocuments(),
    Product.countDocuments({ isFeatured: true, isActive: true }),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: "Pending" }),
    Order.countDocuments({ paymentStatus: "Paid" }),
    Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
    ]),
    JobApplication.countDocuments(),
    Career.countDocuments({ isActive: true }),
    Partner.countDocuments({ isActive: true }),
    Review.countDocuments(),
    Review.countDocuments({ status: "pending" }),
    Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email"),
  ]);

  const totalRevenue = revenueStats.length > 0 ? Math.round(revenueStats[0].totalRevenue * 100) / 100 : 0;

  return sendSuccess(res, "Admin stats fetched", {
    stats: {
      totalUsers,
      activeUsers,
      totalProducts,
      featuredProducts,
      totalOrders,
      pendingOrders,
      paidOrders,
      totalRevenue,
      totalApplications,
      activeJobs,
      totalPartners,
      totalReviews,
      pendingReviews,
    },
    recentOrders,
  });
};

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (search && search.trim()) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(filter),
  ]);

  return sendSuccess(res, "Users fetched", users, 200, {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
};

// @desc    Toggle user active status (Admin)
// @route   PATCH /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = async (req, res) => {
  const { isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  // Prevent disabling self
  if (String(user._id) === String(req.user.id)) {
    return sendError(res, "You cannot deactivate your own admin account", 400);
  }

  user.isActive = Boolean(isActive);
  await user.save();

  return sendSuccess(res, "User status updated", { user });
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private (Admin)
const getOrders = async (req, res) => {
  const { status, paymentStatus, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  return sendSuccess(res, "Orders fetched", orders, 200, {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
};

// @desc    Update order status (Admin)
// @route   PATCH /api/admin/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = async (req, res) => {
  const { orderStatus, paymentStatus } = req.body;

  const update = {};
  if (orderStatus) update.orderStatus = orderStatus;
  if (paymentStatus) update.paymentStatus = paymentStatus;

  const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!order) {
    return sendError(res, "Order not found", 404);
  }

  return sendSuccess(res, "Order status updated", { order });
};

// @desc    Get all job applications (Admin)
// @route   GET /api/admin/applications
// @access  Private (Admin)
const getApplications = async (req, res) => {
  const { status, jobId, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (jobId) filter.job = jobId;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [applications, total] = await Promise.all([
    JobApplication.find(filter)
      .populate("job", "title department location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    JobApplication.countDocuments(filter),
  ]);

  return sendSuccess(res, "Applications fetched", applications, 200, {
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
  });
};

// @desc    Update job application status (Admin)
// @route   PATCH /api/admin/applications/:id/status
// @access  Private (Admin)
const updateApplicationStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["Pending", "Reviewing", "Shortlisted", "Rejected", "Hired"];

  if (!validStatuses.includes(status)) {
    return sendError(res, "Invalid application status", 400);
  }

  const application = await JobApplication.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!application) {
    return sendError(res, "Application not found", 404);
  }

  return sendSuccess(res, "Application status updated", { application });
};

// @desc    Get all reviews with filtering and counts (Admin)
// @route   GET /api/admin/reviews
// @access  Private (Admin)
const getReviews = async (req, res) => {
  const { status, search, page = 1, limit = 50 } = req.query;

  const filter = {};
  if (status && status !== "all") {
    filter.status = status;
  }

  if (search && search.trim()) {
    const searchRegex = new RegExp(search.trim(), "i");
    filter.$or = [
      { userName: searchRegex },
      { userEmail: searchRegex },
      { comment: searchRegex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 50));
  const skip = (pageNum - 1) * limitNum;

  const [reviews, total, pendingCount, approvedCount, hiddenCount] =
    await Promise.all([
      Review.find(filter)
        .populate("product", "title slug images thumbnail price")
        .populate("user", "name email avatar")
        .populate("order", "orderId createdAt total paymentStatus orderStatus")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Review.countDocuments(filter),
      Review.countDocuments({ status: "pending" }),
      Review.countDocuments({ status: "approved" }),
      Review.countDocuments({ status: "hidden" }),
    ]);

  return sendSuccess(res, "Reviews fetched", {
    reviews,
    counts: {
      total: pendingCount + approvedCount + hiddenCount,
      pending: pendingCount,
      approved: approvedCount,
      hidden: hiddenCount,
    },
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

// @desc    Approve/Hide/Update review status (Admin)
// @route   PATCH /api/admin/reviews/:id/status
// @access  Private (Admin)
const approveReview = async (req, res) => {
  const { status, isApproved } = req.body;

  let newStatus = status;
  if (!newStatus && isApproved !== undefined) {
    newStatus = isApproved ? "approved" : "hidden";
  }

  if (!["pending", "approved", "hidden"].includes(newStatus)) {
    return sendError(res, "Invalid review status. Must be pending, approved, or hidden", 400);
  }

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    {
      status: newStatus,
      isApproved: newStatus === "approved",
    },
    { new: true }
  ).populate("product", "title slug images");

  if (!review) {
    return sendError(res, "Review not found", 404);
  }

  await Review.calculateAverageRating(review.product._id || review.product);

  return sendSuccess(res, `Review marked as ${newStatus}`, { review });
};

// @desc    Delete review (Admin)
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin)
const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    return sendError(res, "Review not found", 404);
  }

  const productId = review.product;
  await Review.findByIdAndDelete(req.params.id);
  await Review.calculateAverageRating(productId);

  return sendSuccess(res, "Review deleted successfully");
};

// @desc    Delete job application (Admin)
// @route   DELETE /api/admin/applications/:id
// @access  Private (Admin)
const deleteApplication = async (req, res) => {
  const application = await JobApplication.findById(req.params.id);
  if (!application) {
    return sendError(res, "Application not found", 404);
  }

  await JobApplication.findByIdAndDelete(req.params.id);
  return sendSuccess(res, "Job application deleted successfully");
};

module.exports = {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getOrders,
  updateOrderStatus,
  getApplications,
  updateApplicationStatus,
  deleteApplication,
  getReviews,
  approveReview,
  deleteReview,
};

