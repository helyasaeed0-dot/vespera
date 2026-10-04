const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimitMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { registerValidator, loginValidator } = require("../validators/authValidator");
const asyncHandler = require("../utils/asyncHandler");

// Email + Password Registration & Login
router.post("/register", authLimiter, validate(registerValidator), asyncHandler(authController.register));
router.post("/login", authLimiter, validate(loginValidator), asyncHandler(authController.login));
router.post("/logout", asyncHandler(authController.logout));
router.get("/me", protect, asyncHandler(authController.getMe));
router.post("/refresh", asyncHandler(authController.refreshToken));

// Google OAuth 2.0 Official Endpoints
router.get("/google", asyncHandler(authController.initiateGoogle));
router.get("/google/callback", asyncHandler(authController.googleCallback));
router.post("/google", authLimiter, asyncHandler(authController.googleAuth));

module.exports = router;
