const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const asyncHandler = require("../utils/asyncHandler");

router.use(protect); // All user routes require authentication

// Profile
router.get("/me", asyncHandler(userController.getUserProfile));
router.patch("/me", asyncHandler(userController.updateUserProfile));
router.patch("/change-password", asyncHandler(userController.changePassword));

// Orders & Applications
router.get("/me/orders", asyncHandler(userController.getMyOrders));
router.get("/me/applications", asyncHandler(userController.getMyApplications));

// Address Book
router.get("/me/addresses", asyncHandler(userController.getAddresses));
router.post("/me/addresses", asyncHandler(userController.addAddress));
router.put("/me/addresses/:addressId", asyncHandler(userController.updateAddress));
router.delete("/me/addresses/:addressId", asyncHandler(userController.deleteAddress));

module.exports = router;
