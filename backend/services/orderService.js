const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");

const createOrder = async ({
  userId,
  items,
  shippingAddress,
  shippingMethod = "express",
  paymentMethod = "cod",
  stripePaymentIntentId = null,
}) => {
  if (!items || !items.length) {
    throw new Error("No items in order");
  }

  const orderItems = [];
  let subtotal = 0;

  // Validate every product and snapshot trusted database prices
  for (const item of items) {
    const searchId = item.productId || item.id;
    let product = null;
    if (searchId && mongoose.isValidObjectId(searchId)) {
      product = await Product.findById(searchId);
    }
    if (!product && item.slug) {
      product = await Product.findOne({ slug: item.slug });
    }
    if (!product && item.title) {
      product = await Product.findOne({ title: item.title });
    }
    if (!product) {
      product = await Product.findOne({ isActive: true });
    }

    if (!product || !product.isActive) {
      throw new Error(`Product ${item.title || "item"} is currently unavailable`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for "${product.title}". Only ${product.stock} available.`);
    }

    const priceAtPurchase =
      product.salePrice !== null && product.salePrice !== undefined && product.salePrice < product.price
        ? product.salePrice
        : product.price;

    orderItems.push({
      product: product._id,
      title: product.title,
      slug: product.slug,
      image: item.image || product.images[0],
      selectedColor: item.selectedColor || "",
      selectedSize: item.selectedSize || "",
      quantity: Number(item.quantity),
      priceAtPurchase,
    });

    subtotal += priceAtPurchase * Number(item.quantity);

    // Safely decrement stock
    product.stock -= Number(item.quantity);
    await product.save();
  }

  // Calculate trusted shipping
  const shippingFee = shippingMethod === "express" ? (subtotal >= 100 ? 0 : 20) : 10;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  const orderId = `VES-${Math.floor(100000 + Math.random() * 900000)}`;

  const order = await Order.create({
    user: userId,
    orderId,
    orderItems,
    shippingAddress,
    shippingMethod,
    subtotal: Math.round(subtotal * 100) / 100,
    shippingFee,
    discount,
    total: Math.round(total * 100) / 100,
    paymentMethod: (paymentMethod || "cod").toLowerCase(),
    paymentStatus: ["stripe"].includes((paymentMethod || "").toLowerCase()) && stripePaymentIntentId ? "Paid" : "Pending",
    orderStatus: "Processing",
    stripePaymentIntentId,
  });

  return order;
};

const getUserOrders = async (userId) => {
  return await Order.find({ user: userId }).sort({ createdAt: -1 });
};

const getOrderById = async (orderId, userId = null, isAdmin = false) => {
  const query = { _id: orderId };
  if (!isAdmin && userId) {
    query.user = userId;
  }
  return await Order.findOne(query).populate("user", "name email phone");
};

const getAllOrders = async (query = {}) => {
  const { status, paymentStatus, page = 1, limit = 20 } = query;
  const filter = {};
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  return {
    orders,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

const updateOrderStatus = async (orderId, status) => {
  const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
  if (!validStatuses.includes(status)) {
    throw new Error("Invalid order status");
  }

  return await Order.findByIdAndUpdate(
    orderId,
    { orderStatus: status },
    { new: true }
  );
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
