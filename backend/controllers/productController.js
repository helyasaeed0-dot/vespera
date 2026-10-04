const productService = require("../services/productService");
const { uploadBuffer } = require("../services/uploadService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Get all products with filtering & pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const result = await productService.getProducts({
    ...req.query,
    isAdmin: req.user && req.user.role === "admin",
  });
  return sendSuccess(res, "Products fetched successfully", { products: result.products }, 200, result.meta);
};

// @desc    Get homepage featured products (8 by default)
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  const products = await productService.getFeaturedProducts(8);
  return sendSuccess(res, "Featured products fetched", { products });
};

// @desc    Get home page products (showOnHomePage = true, max 8)
// @route   GET /api/products/home
// @access  Public
const getHomeProducts = async (req, res) => {
  const products = await productService.getHomeProducts(8);
  return sendSuccess(res, "Home page products fetched", { products });
};

// @desc    Get single product by id or slug
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  const product = await productService.getProductByIdOrSlug(req.params.id);
  if (!product) {
    return sendError(res, "Product not found", 404);
  }
  return sendSuccess(res, "Product details fetched", { product });
};

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Private (Admin)
const createProduct = async (req, res) => {
  const data = req.body;

  let rawImages = data.imageObjects || data.images || [];
  if (Array.isArray(rawImages)) {
    const normalizedImageObjects = rawImages
      .map((img) => {
        if (typeof img === "object" && img !== null) {
          return {
            url: img.url || "",
            color: typeof img.color === "string" ? img.color.trim() : "",
          };
        } else if (typeof img === "string") {
          return {
            url: img,
            color: typeof data.color === "string" ? data.color.trim() : "",
          };
        }
        return { url: "", color: "" };
      })
      .filter((img) => img.url);

    data.imageObjects = normalizedImageObjects;
    data.images = normalizedImageObjects.map((img) => img.url);

    const uniqueColors = [...new Set(normalizedImageObjects.map((img) => img.color).filter(Boolean))];
    data.colors = uniqueColors;
    data.color = uniqueColors[0] || (typeof data.color === "string" ? data.color.trim() : "");
  }

  // Auto-generate slug if not provided
  if (!data.slug && data.title) {
    data.slug = data.title
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  }

  // Ensure categorySlug exists
  if (!data.categorySlug && data.category) {
    data.categorySlug = data.category
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  }

  const product = await productService.createProduct(data);
  return sendSuccess(res, "Product created successfully", { product }, 201);
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private (Admin)
const updateProduct = async (req, res) => {
  const data = req.body;

  let rawImages = data.imageObjects || data.images || [];
  if (Array.isArray(rawImages)) {
    const normalizedImageObjects = rawImages
      .map((img) => {
        if (typeof img === "object" && img !== null) {
          return {
            url: img.url || "",
            color: typeof img.color === "string" ? img.color.trim() : "",
          };
        } else if (typeof img === "string") {
          return {
            url: img,
            color: typeof data.color === "string" ? data.color.trim() : "",
          };
        }
        return { url: "", color: "" };
      })
      .filter((img) => img.url);

    data.imageObjects = normalizedImageObjects;
    data.images = normalizedImageObjects.map((img) => img.url);

    const uniqueColors = [...new Set(normalizedImageObjects.map((img) => img.color).filter(Boolean))];
    data.colors = uniqueColors;
    data.color = uniqueColors[0] || (typeof data.color === "string" ? data.color.trim() : "");
  }

  if (data.category && !data.categorySlug) {
    data.categorySlug = data.category
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-");
  }
  const product = await productService.updateProduct(req.params.id, data);
  if (!product) {
    return sendError(res, "Product not found", 404);
  }
  return sendSuccess(res, "Product updated successfully", { product });
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = async (req, res) => {
  const product = await productService.deleteProduct(req.params.id);
  if (!product) {
    return sendError(res, "Product not found", 404);
  }
  return sendSuccess(res, "Product deleted successfully");
};

// @desc    Upload product image (Admin)
// @route   POST /api/products/upload-image
// @access  Private (Admin)
const uploadProductImage = async (req, res) => {
  if (!req.file) {
    return sendError(res, "No image file provided", 400);
  }

  const result = await uploadBuffer(req.file.buffer, "vespera/products", "image", req.file.originalname);
  return sendSuccess(res, "Image uploaded successfully", {
    url: result.url,
    publicId: result.publicId,
  });
};

module.exports = {
  getProducts,
  getHomeProducts,
  getFeaturedProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
};
