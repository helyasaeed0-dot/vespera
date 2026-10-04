const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewController = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");
const asyncHandler = require("../utils/asyncHandler");

// 1. Public: Get approved reviews for a product (by product _id or slug)
router.get("/product/:productId", asyncHandler(reviewController.getProductReviews));
router.get("/:productId/reviews", asyncHandler(reviewController.getProductReviews));

// 2. Private: Check user review eligibility for a product
router.get(
  "/product/:productId/eligibility",
  protect,
  asyncHandler(reviewController.checkReviewEligibility)
);

// 3. Private: Create a new review (purchase verified by backend)
router.post("/", protect, asyncHandler(reviewController.createReview));
router.post("/product/:productId", protect, asyncHandler(reviewController.createReview));
router.post("/:productId/reviews", protect, asyncHandler(reviewController.createReview));

// 4. Private: Update or delete own review
router.put("/:id", protect, asyncHandler(reviewController.updateReview));
router.delete("/:id", protect, asyncHandler(reviewController.deleteReview));

// 5. Admin: Moderate review status (approve, hide, pending)
router.patch(
  "/:id/status",
  protect,
  requireAdmin,
  asyncHandler(reviewController.updateReviewStatus)
);
router.patch(
  "/:id/approve",
  protect,
  requireAdmin,
  asyncHandler(reviewController.updateReviewStatus)
);

module.exports = router;
