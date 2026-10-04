const orderService = require("../services/orderService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, shippingMethod, paymentMethod, stripePaymentIntentId } = req.body;

    // Server-side validation of required checkout fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, "Cart cannot be empty. Please add items before checkout.", 400);
    }

    if (!shippingAddress) {
      return sendError(res, "Shipping address is required.", 400);
    }

    const { fullName, email, street, city } = shippingAddress || {};

    if (!street || !street.trim()) {
      return sendError(res, "Street address is required.", 400);
    }
    if (!city || !city.trim()) {
      return sendError(res, "City is required.", 400);
    }

    if (!paymentMethod) {
      return sendError(res, "Payment method is required.", 400);
    }

    const order = await orderService.createOrder({
      userId: req.user.id,
      items,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      stripePaymentIntentId,
    });

    return sendSuccess(res, "Order placed successfully", { order }, 201);
  } catch (error) {
    return sendError(res, error.message, 400);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await orderService.getUserOrders(req.user.id);
  return sendSuccess(res, "Orders fetched", { orders });
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  const isAdmin = req.user.role === "admin";
  const order = await orderService.getOrderById(req.params.id, req.user.id, isAdmin);

  if (!order) {
    return sendError(res, "Order not found or unauthorized", 404);
  }

  return sendSuccess(res, "Order details fetched", { order });
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};
