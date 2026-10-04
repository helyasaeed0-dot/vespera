const Category = require("../models/Category");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  const filter = req.query.all === "true" ? {} : { isActive: true };
  const categories = await Category.find(filter).sort({ name: 1 });
  return sendSuccess(res, "Categories fetched", { categories });
};

// @desc    Get category by id or slug
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  const category = (await Category.findById(req.params.id)) || (await Category.findOne({ slug: req.params.id }));
  if (!category) {
    return sendError(res, "Category not found", 404);
  }
  return sendSuccess(res, "Category details", { category });
};

// @desc    Create category (Admin)
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
  const { name, description, image, subcategories } = req.body;

  const slug = req.body.slug || name.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");

  const existing = await Category.findOne({ slug });
  if (existing) {
    return sendError(res, "Category with this slug already exists", 409);
  }

  const category = await Category.create({
    name,
    slug,
    description,
    image,
    subcategories: subcategories || [],
  });

  return sendSuccess(res, "Category created successfully", { category }, 201);
};

// @desc    Update category (Admin)
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res) => {
  if (req.body.name && !req.body.slug) {
    req.body.slug = req.body.name.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-");
  }

  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return sendError(res, "Category not found", 404);
  }

  return sendSuccess(res, "Category updated successfully", { category });
};

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return sendError(res, "Category not found", 404);
  }
  return sendSuccess(res, "Category deleted successfully");
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
