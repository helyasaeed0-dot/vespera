const Product = require("../models/Product");

const getProducts = async (query = {}) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    inStockOnly,
    minRating,
    sortBy = "newest",
    page = 1,
    limit = 12,
    isAdmin = false,
  } = query;

  const filter = {};

  // Regular users only see active products
  if (!isAdmin) {
    filter.isActive = true;
  }

  // Category filter
  if (category) {
    if (Array.isArray(category)) {
      filter.categorySlug = { $in: category };
    } else {
      filter.categorySlug = category;
    }
  }

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  // Stock filter
  if (inStockOnly === "true" || inStockOnly === true) {
    filter.stock = { $gt: 0 };
  }

  // Rating filter
  if (minRating) {
    filter.rating = { $gte: Number(minRating) };
  }

  // Search filter
  if (search && search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { description: { $regex: search.trim(), $options: "i" } },
      { category: { $regex: search.trim(), $options: "i" } },
    ];
  }

  // Sorting
  let sort = { createdAt: -1 };
  if (sortBy === "price-low") sort = { price: 1 };
  if (sortBy === "price-high") sort = { price: -1 };
  if (sortBy === "rating") sort = { rating: -1 };
  if (sortBy === "newest") sort = { createdAt: -1 };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limitNum),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

const getHomeProducts = async (limit = 8) => {
  // Prefer showOnHomePage, fallback to isFeatured
  let products = await Product.find({ isActive: true, showOnHomePage: true })
    .sort({ updatedAt: -1 })
    .limit(limit);

  // If showOnHomePage returns fewer than limit, fill with isFeatured
  if (products.length < limit) {
    const remainingCount = limit - products.length;
    const existingIds = products.map((p) => p._id);
    const fillers = await Product.find({
      isActive: true,
      isFeatured: true,
      _id: { $nin: existingIds },
    })
      .sort({ rating: -1, createdAt: -1 })
      .limit(remainingCount);
    products = [...products, ...fillers];
  }

  return products.slice(0, limit);
};

const getFeaturedProducts = async (limit = 8) => {
  return getHomeProducts(limit);
};

const getProductByIdOrSlug = async (identifier) => {
  let product = null;
  // If valid ObjectId, search by ID first
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(identifier);
  }
  // Otherwise search by slug
  if (!product) {
    product = await Product.findOne({ slug: identifier });
  }
  return product;
};

const createProduct = async (productData) => {
  return await Product.create(productData);
};

const updateProduct = async (id, updateData) => {
  return await Product.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};

module.exports = {
  getProducts,
  getHomeProducts,
  getFeaturedProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
