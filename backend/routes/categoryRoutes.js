const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");
const { validate } = require("../middleware/validationMiddleware");
const { categoryValidator } = require("../validators/productValidator");
const asyncHandler = require("../utils/asyncHandler");

router.get("/", asyncHandler(categoryController.getCategories));
router.get("/:id", asyncHandler(categoryController.getCategoryById));

router.post(
  "/",
  protect,
  requireAdmin,
  validate(categoryValidator),
  asyncHandler(categoryController.createCategory)
);

router.put(
  "/:id",
  protect,
  requireAdmin,
  asyncHandler(categoryController.updateCategory)
);

router.delete(
  "/:id",
  protect,
  requireAdmin,
  asyncHandler(categoryController.deleteCategory)
);

module.exports = router;
