const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");
const asyncHandler = require("../utils/asyncHandler");

router.use(protect, requireAdmin); // All routes in this router require admin role

// Dashboard statistics
router.get("/dashboard/stats", asyncHandler(adminController.getDashboardStats));

// Users management
router.get("/users", asyncHandler(adminController.getUsers));
router.patch("/users/:id/status", asyncHandler(adminController.updateUserStatus));

// Orders management
router.get("/orders", asyncHandler(adminController.getOrders));
router.patch("/orders/:id/status", asyncHandler(adminController.updateOrderStatus));

// Job Applications management
router.get("/applications", asyncHandler(adminController.getApplications));
router.patch("/applications/:id/status", asyncHandler(adminController.updateApplicationStatus));
router.delete("/applications/:id", asyncHandler(adminController.deleteApplication));

// Reviews moderation
router.get("/reviews", asyncHandler(adminController.getReviews));
router.patch("/reviews/:id/status", asyncHandler(adminController.approveReview));
router.patch("/reviews/:id/approve", asyncHandler(adminController.approveReview));
router.delete("/reviews/:id", asyncHandler(adminController.deleteReview));

module.exports = router;
