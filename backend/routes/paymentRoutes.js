const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

// Protected: create intent with server-side trusted price verification
router.post("/create-payment-intent", protect, asyncHandler(paymentController.createPaymentIntent));

// Public: Stripe Webhook
router.post("/webhook", asyncHandler(paymentController.handleWebhook));

module.exports = router;
