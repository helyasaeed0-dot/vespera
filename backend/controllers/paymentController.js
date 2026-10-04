const Product = require("../models/Product");
const Order = require("../models/Order");
const paymentService = require("../services/paymentService");
const { sendSuccess, sendError } = require("../utils/apiResponse");
const logger = require("../utils/logger");

// @desc    Create Stripe PaymentIntent with server-verified total
// @route   POST /api/payments/create-payment-intent
// @access  Private
const createPaymentIntent = async (req, res) => {
  const { items, shippingMethod = "express" } = req.body;

  if (!items || !items.length) {
    return sendError(res, "Cannot create payment intent without items", 400);
  }

  // Calculate trusted total server-side
  let subtotal = 0;
  for (const item of items) {
    const product = await Product.findById(item.productId || item.id);
    if (!product || !product.isActive) {
      return sendError(res, `Item "${item.title || "product"}" is unavailable`, 400);
    }
    const price =
      product.salePrice !== null && product.salePrice !== undefined && product.salePrice < product.price
        ? product.salePrice
        : product.price;

    subtotal += price * Number(item.quantity);
  }

  const shippingFee = shippingMethod === "express" ? (subtotal >= 100 ? 0 : 20) : 10;
  const totalAmount = subtotal + shippingFee;

  const paymentIntent = await paymentService.createPaymentIntent(totalAmount, {
    userId: req.user.id,
    itemCount: String(items.length),
  });

  return sendSuccess(res, "Payment intent created", {
    clientSecret: paymentIntent.clientSecret,
    paymentIntentId: paymentIntent.id,
    amount: totalAmount,
  });
};

// @desc    Handle Stripe Webhook
// @route   POST /api/payments/webhook
// @access  Public (Signature protected)
const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = paymentService.verifyWebhookSignature(req.rawBody || req.body, sig);
  } catch (err) {
    logger.error("Stripe Webhook Signature Verification Failed", { error: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    logger.info(`PaymentIntent succeeded: ${paymentIntent.id}`);

    // Update order payment status
    await Order.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { paymentStatus: "Paid", orderStatus: "Processing" }
    );
  } else if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    logger.warn(`PaymentIntent failed: ${paymentIntent.id}`);

    await Order.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { paymentStatus: "Failed" }
    );
  }

  return res.json({ received: true });
};

module.exports = {
  createPaymentIntent,
  handleWebhook,
};
