const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

// All cart routes require authentication
router.use(protect);

router.get("/", asyncHandler(cartController.getCart));
router.post("/add", asyncHandler(cartController.addToCart));
router.put("/update", asyncHandler(cartController.updateCartItem));
router.delete("/remove/:itemId", asyncHandler(cartController.removeFromCart));
router.delete("/clear", asyncHandler(cartController.clearCart));

module.exports = router;
