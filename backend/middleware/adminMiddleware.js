const { sendError } = require("../utils/apiResponse");

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return sendError(res, "Access denied. Administrator privileges required.", 403);
  }
};

module.exports = {
  requireAdmin,
};
