const JobApplication = require("../models/JobApplication");
const Career = require("../models/Career");
const { uploadBuffer } = require("../services/uploadService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Submit job application (with CV document)
// @route   POST /api/applications
// @access  Public / Optional Auth
const submitApplication = async (req, res) => {
  const { jobId, fullName, email, phone, linkedinUrl, coverLetter, resumeUrl: bodyResumeUrl, resumeName: bodyResumeName } = req.body;

  if (!jobId) {
    return sendError(res, "Job ID is required", 400);
  }

  if (!fullName || !email || !phone) {
    return sendError(res, "Full name, email, and phone number are required", 400);
  }

  const job = await Career.findById(jobId);
  if (!job) {
    return sendError(res, "Selected job listing does not exist", 404);
  }

  let resumeUrl = bodyResumeUrl;
  let resumePublicId = "";
  let resumeName = bodyResumeName || "Resume.pdf";

  // If file was uploaded via multer in form-data
  if (req.file) {
    const uploadResult = await uploadBuffer(req.file.buffer, "vespera/resumes", "raw", req.file.originalname);
    resumeUrl = uploadResult.url;
    resumePublicId = uploadResult.publicId;
    resumeName = req.file.originalname;
  }

  if (!resumeUrl) {
    return sendError(res, "Resume / CV document is required", 400);
  }

  const application = await JobApplication.create({
    job: job._id,
    jobTitle: job.title,
    department: job.department,
    user: req.user.id,
    fullName,
    email,
    phone,
    linkedinUrl: linkedinUrl || "",
    resumeUrl,
    resumePublicId,
    resumeName,
    coverLetter: coverLetter || "",
    status: "Pending",
  });

  return sendSuccess(res, "Application submitted successfully", { application }, 201);
};

// @desc    Get user's own job applications
// @route   GET /api/applications/my-applications
// @access  Private
const getMyApplications = async (req, res) => {
  const applications = await JobApplication.find({
    $or: [{ user: req.user.id }, { email: req.user.email }],
  })
    .populate("job", "title department location type")
    .sort({ createdAt: -1 });

  return sendSuccess(res, "Applications fetched", { applications });
};

// @desc    Get application details
// @route   GET /api/applications/:id
// @access  Private (Owner or Admin)
const getApplicationById = async (req, res) => {
  const application = await JobApplication.findById(req.params.id).populate("job");
  if (!application) {
    return sendError(res, "Application not found", 404);
  }

  const isOwner = req.user && (String(application.user) === String(req.user.id) || application.email === req.user.email);
  const isAdmin = req.user && req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return sendError(res, "Not authorized to view this application", 403);
  }

  return sendSuccess(res, "Application details fetched", { application });
};

module.exports = {
  submitApplication,
  getMyApplications,
  getApplicationById,
};
