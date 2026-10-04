const Career = require("../models/Career");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Get all active careers
// @route   GET /api/careers
// @access  Public
const getCareers = async (req, res) => {
  const isAdmin = req.user && req.user.role === "admin";
  const filter = isAdmin ? {} : { isActive: true };

  const careers = await Career.find(filter).sort({ createdAt: -1 });
  return sendSuccess(res, "Career listings fetched", { careers });
};

// @desc    Get single career listing
// @route   GET /api/careers/:id
// @access  Public
const getCareerById = async (req, res) => {
  const career = await Career.findById(req.params.id);
  if (!career) {
    return sendError(res, "Career listing not found", 404);
  }
  return sendSuccess(res, "Career details fetched", { career });
};

// @desc    Create job listing (Admin)
// @route   POST /api/careers
// @access  Private (Admin)
const createCareer = async (req, res) => {
  const data = { ...req.body };
  if (!data.experience) {
    data.experience = data.experienceLevel || "2+ Years";
  }
  if (data.employmentType && !data.type) {
    const map = {
      "Full-Time": "FULL_TIME",
      "Part-Time": "PART_TIME",
      "Remote": "REMOTE",
      "Hybrid": "HYBRID",
    };
    data.type = map[data.employmentType] || data.employmentType.toUpperCase().replace("-", "_");
  }
  if (!data.type) data.type = "FULL_TIME";

  const career = await Career.create(data);
  return sendSuccess(res, "Career listing created successfully", { career }, 201);
};

// @desc    Update job listing (Admin)
// @route   PUT /api/careers/:id
// @access  Private (Admin)
const updateCareer = async (req, res) => {
  const data = { ...req.body };
  if (data.employmentType && !data.type) {
    const map = {
      "Full-Time": "FULL_TIME",
      "Part-Time": "PART_TIME",
      "Remote": "REMOTE",
      "Hybrid": "HYBRID",
    };
    data.type = map[data.employmentType] || data.employmentType.toUpperCase().replace("-", "_");
  }

  const career = await Career.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  });

  if (!career) {
    return sendError(res, "Career listing not found", 404);
  }

  return sendSuccess(res, "Career listing updated successfully", { career });
};

// @desc    Delete job listing (Admin)
// @route   DELETE /api/careers/:id
// @access  Private (Admin)
const deleteCareer = async (req, res) => {
  const career = await Career.findByIdAndDelete(req.params.id);
  if (!career) {
    return sendError(res, "Career listing not found", 404);
  }
  return sendSuccess(res, "Career listing deleted successfully");
};

module.exports = {
  getCareers,
  getCareerById,
  createCareer,
  updateCareer,
  deleteCareer,
};
