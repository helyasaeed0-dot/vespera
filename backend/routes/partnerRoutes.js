const express = require("express");
const router = express.Router();
const partnerController = require("../controllers/partnerController");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");
const { uploadImage } = require("../config/cloudinary");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", asyncHandler(partnerController.getPartners));
router.post("/inquiry", protect, asyncHandler(partnerController.submitPartnerInquiry));
router.get("/requests", protect, requireAdmin, asyncHandler(partnerController.getPartnerRequests));
router.patch("/requests/:id/status", protect, requireAdmin, asyncHandler(partnerController.updatePartnerRequestStatus));
router.delete("/requests/:id", protect, requireAdmin, asyncHandler(partnerController.deletePartnerRequest));
router.get("/:id", asyncHandler(partnerController.getPartnerById));

// Admin routes
router.post(
  "/",
  protect,
  requireAdmin,
  uploadImage.single("logo"),
  asyncHandler(partnerController.createPartner)
);

router.put(
  "/:id",
  protect,
  requireAdmin,
  uploadImage.single("logo"),
  asyncHandler(partnerController.updatePartner)
);

router.delete(
  "/:id",
  protect,
  requireAdmin,
  asyncHandler(partnerController.deletePartner)
);

module.exports = router;
