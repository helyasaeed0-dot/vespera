/**
 * Standardized API responses
 */
const sendResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  if (meta !== null && meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const sendSuccess = (res, message = "Success", data = null, statusCode = 200, meta = null) => {
  return sendResponse(res, statusCode, true, message, data, meta);
};

const sendError = (res, message = "An error occurred", statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};

module.exports = {
  sendResponse,
  sendSuccess,
  sendError,
};
