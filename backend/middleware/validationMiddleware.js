const { validationResult } = require("express-validator");
const { sendError } = require("../utils/apiResponse");

const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return sendError(res, "Input validation failed", 400, extractedErrors);
  };
};

module.exports = {
  validate,
};
