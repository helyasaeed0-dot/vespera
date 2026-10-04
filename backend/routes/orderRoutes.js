const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { orderValidator } = require("../validators/productValidator");
const asyncHandler = require("../utils/asyncHandler");

router.use(protect); // All order routes require authentication

router.post("/", validate(orderValidator), asyncHandler(orderController.createOrder));
router.get("/my-orders", asyncHandler(orderController.getMyOrders));
router.get("/:id", asyncHandler(orderController.getOrderById));

module.exports = router;
