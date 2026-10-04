const Stripe = require("stripe");
const config = require("../config/env");
const logger = require("../utils/logger");

let stripe = null;
if (config.STRIPE_SECRET_KEY) {
  stripe = new Stripe(config.STRIPE_SECRET_KEY);
}

const createPaymentIntent = async (amountInDollars, metadata = {}) => {
  if (!stripe) {
    logger.warn("Stripe secret key not configured. Generating simulated payment intent for local testing.");
    return {
      clientSecret: `simulated_pi_secret_${Date.now()}`,
      id: `simulated_pi_${Date.now()}`,
    };
  }

  const amount = Math.round(amountInDollars * 100); // Convert to cents

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
    metadata,
  });

  return {
    clientSecret: paymentIntent.client_secret,
    id: paymentIntent.id,
  };
};

const verifyWebhookSignature = (payload, signature) => {
  if (!stripe || !config.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe or webhook secret not configured");
  }

  return stripe.webhooks.constructEvent(payload, signature, config.STRIPE_WEBHOOK_SECRET);
};

module.exports = {
  createPaymentIntent,
  verifyWebhookSignature,
};
