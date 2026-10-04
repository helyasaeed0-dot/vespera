const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Get authenticated user's cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate(
    "items.product",
    "title slug price salePrice images stock isActive"
  );

  if (!cart) {
    cart = { user: req.user.id, items: [] };
  }

  return sendSuccess(res, "Cart fetched", { cart });
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = async (req, res) => {
  const { productId, quantity = 1, selectedColor, selectedSize } = req.body;

  if (!productId || !mongoose.isValidObjectId(productId)) {
    return sendError(res, "Valid product ID is required", 400);
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return sendError(res, "Product not found or unavailable", 404);
  }

  if (product.stock < quantity) {
    return sendError(
      res,
      `Insufficient stock. Only ${product.stock} available.`,
      400
    );
  }

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  // Check if this item (same product + color + size) is already in cart
  const existingIdx = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      (item.selectedColor || "") === (selectedColor || "") &&
      (item.selectedSize || "") === (selectedSize || "")
  );

  if (existingIdx >= 0) {
    cart.items[existingIdx].quantity += Number(quantity);
  } else {
    const activePrice =
      product.salePrice !== null &&
      product.salePrice !== undefined &&
      product.salePrice < product.price
        ? product.salePrice
        : product.price;

    cart.items.push({
      product: product._id,
      title: product.title,
      slug: product.slug,
      image: product.images && product.images.length > 0 ? product.images[0] : "",
      price: product.price,
      salePrice: product.salePrice,
      selectedColor: selectedColor || "",
      selectedSize: selectedSize || "",
      quantity: Number(quantity),
    });
  }

  await cart.save();
  return sendSuccess(res, "Item added to cart", { cart }, 200);
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
const updateCartItem = async (req, res) => {
  const { itemId, quantity } = req.body;

  if (!itemId) {
    return sendError(res, "Cart item ID is required", 400);
  }

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return sendError(res, "Cart not found", 404);
  }

  const item = cart.items.id(itemId);
  if (!item) {
    return sendError(res, "Item not found in cart", 404);
  }

  if (quantity <= 0) {
    cart.items.pull(itemId);
  } else {
    item.quantity = Number(quantity);
  }

  await cart.save();
  return sendSuccess(res, "Cart updated", { cart });
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  const { itemId } = req.params;

  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return sendError(res, "Cart not found", 404);
  }

  const item = cart.items.id(itemId);
  if (!item) {
    return sendError(res, "Item not found in cart", 404);
  }

  cart.items.pull(itemId);
  await cart.save();
  return sendSuccess(res, "Item removed from cart", { cart });
};

// @desc    Clear all items from cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  return sendSuccess(res, "Cart cleared", { cart: cart || { items: [] } });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
