const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const config = require("./config/env");

// Middleware imports
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { apiLimiter } = require("./middleware/rateLimitMiddleware");
const { csrfProtection } = require("./middleware/csrfMiddleware");

// Route imports
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const careerRoutes = require("./routes/careerRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const partnerRoutes = require("./routes/partnerRoutes");
const cartRoutes = require("./routes/cartRoutes");
const adminRoutes = require("./routes/adminRoutes");

const path = require("path");

const app = express();
// Required on Render: app runs behind a proxy, so trust the first hop
// for correct client IPs (rate limiter) and secure cookies
app.set("trust proxy", 1);
// Security HTTP headers (configured to allow cross-origin media assets)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Serve local uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// CORS configuration (strictly allows frontend origin with credentials)
const allowedOrigins = [
  config.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS: Origin not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body parser with raw body capture for Stripe webhook signature verification
app.use(
  express.json({
    limit: "10mb",
    verify: (req, res, buf) => {
      if (req.originalUrl && req.originalUrl.includes("/api/payments/webhook")) {
        req.rawBody = buf;
      }
    },
  })
);

app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser for secure HTTP-only cookie authentication
app.use(cookieParser(config.COOKIE_SECRET));

// CSRF validation on state-changing requests
app.use(csrfProtection);

// Global API rate limiting
app.use("/api", apiLimiter);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Vespera Enterprise REST API",
    version: "1.0.0",
    documentation: "/api/health",
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Vespera Enterprise API",
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/partners", partnerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

module.exports = app;
