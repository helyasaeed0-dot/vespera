const express = require("express");
const router = express.Router();
const applicationController = require("../controllers/applicationController");
const { protect } = require("../middleware/authMiddleware");
const { uploadDocument } = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");

// Application submission requires authentication
router.post(
  "/",
  protect,
  uploadDocument.single("resume"),
  asyncHandler(applicationController.submitApplication)
);

router.get("/my-applications", protect, asyncHandler(applicationController.getMyApplications));
router.get("/:id", protect, asyncHandler(applicationController.getApplicationById));

module.exports = router;
