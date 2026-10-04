const express = require("express");
const router = express.Router();
const careerController = require("../controllers/careerController");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", asyncHandler(careerController.getCareers));
router.get("/:id", asyncHandler(careerController.getCareerById));

// Admin routes
router.post("/", protect, requireAdmin, asyncHandler(careerController.createCareer));
router.put("/:id", protect, requireAdmin, asyncHandler(careerController.updateCareer));
router.delete("/:id", protect, requireAdmin, asyncHandler(careerController.deleteCareer));

module.exports = router;
