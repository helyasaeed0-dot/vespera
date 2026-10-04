const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware");
const { requireAdmin } = require("../middleware/adminMiddleware");
const { uploadImage } = require("../config/cloudinary");
const { validate } = require("../middleware/validationMiddleware");
const { productValidator } = require("../validators/productValidator");
const asyncHandler = require("../utils/asyncHandler");

// Public routes
router.get("/", asyncHandler(productController.getProducts));
router.get("/featured", asyncHandler(productController.getFeaturedProducts));
router.get("/home", asyncHandler(productController.getHomeProducts));
router.get("/:id", asyncHandler(productController.getProductById));

// Admin routes
router.post(
  "/",
  protect,
  requireAdmin,
  validate(productValidator),
  asyncHandler(productController.createProduct)
);

router.put(
  "/:id",
  protect,
  requireAdmin,
  asyncHandler(productController.updateProduct)
);

router.delete(
  "/:id",
  protect,
  requireAdmin,
  asyncHandler(productController.deleteProduct)
);

router.post(
  "/upload-image",
  protect,
  requireAdmin,
  uploadImage.single("image"),
  asyncHandler(productController.uploadProductImage)
);

module.exports = router;
