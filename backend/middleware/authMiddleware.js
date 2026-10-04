const jwt = require("jsonwebtoken");
const config = require("../config/env");
const User = require("../models/User");
const { sendError } = require("../utils/apiResponse");

const protect = async (req, res, next) => {
  try {
    let token = null;

    // Check HTTP-only cookie first
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      // Fallback to Bearer token
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return sendError(res, "Not authorized, no session token provided", 401);
    }

    // Verify token
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);

    // Fetch user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return sendError(res, "User belonging to this token no longer exists", 401);
    }

    if (!user.isActive) {
      return sendError(res, "Account is disabled. Please contact support.", 403);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return sendError(res, "Session expired, please login again", 401);
    }
    return sendError(res, "Not authorized, token verification failed", 401);
  }
};

module.exports = {
  protect,
};
