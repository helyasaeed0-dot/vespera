const { body, param } = require("express-validator");

const productValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ max: 200 })
    .withMessage("Title cannot exceed 200 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),
  body("salePrice")
    .optional({ nullable: true, checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage("Sale price must be a positive number"),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be an integer of at least 0"),
];

const categoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required"),
  body("description")
    .optional()
    .trim(),
];

const orderValidator = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Order must have at least one item"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Item quantity must be at least 1"),
  body("shippingAddress.street")
    .trim()
    .notEmpty()
    .withMessage("Street address is required"),
  body("shippingAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required"),
  body("paymentMethod")
    .isIn(["stripe", "cod", "Stripe", "COD"])
    .withMessage("Payment method must be 'stripe' or 'cod'"),
];

const reviewValidator = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("comment")
    .trim()
    .notEmpty()
    .withMessage("Review comment cannot be empty")
    .isLength({ max: 1000 })
    .withMessage("Review comment cannot exceed 1000 characters"),
];

const applicationValidator = [
  body("jobId")
    .isMongoId()
    .withMessage("Valid job ID is required"),
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Valid email address is required"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required"),
];

module.exports = {
  productValidator,
  categoryValidator,
  orderValidator,
  reviewValidator,
  applicationValidator,
};
