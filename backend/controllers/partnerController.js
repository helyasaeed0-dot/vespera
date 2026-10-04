const Partner = require("../models/Partner");
const { uploadBuffer } = require("../services/uploadService");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Get all active partners
// @route   GET /api/partners
// @access  Public
const getPartners = async (req, res) => {
  const isAdmin = req.user && req.user.role === "admin";
  const filter = isAdmin ? {} : { isActive: true };

  const partners = await Partner.find(filter).sort({ createdAt: -1 });
  return sendSuccess(res, "Partners fetched", { partners });
};

// @desc    Get partner by ID
// @route   GET /api/partners/:id
// @access  Public
const getPartnerById = async (req, res) => {
  const partner = await Partner.findById(req.params.id);
  if (!partner) {
    return sendError(res, "Partner not found", 404);
  }
  return sendSuccess(res, "Partner details", { partner });
};

// @desc    Create partner (Admin)
// @route   POST /api/partners
// @access  Private (Admin)
const createPartner = async (req, res) => {
  let partnerData = { ...req.body };

  if (!partnerData.name && (partnerData.partner || partnerData.company)) {
    partnerData.name = partnerData.partner || partnerData.company;
  }
  if (!partnerData.partner && (partnerData.company || partnerData.name)) {
    partnerData.partner = partnerData.company || partnerData.name;
  }
  if (!partnerData.company && (partnerData.partner || partnerData.name)) {
    partnerData.company = partnerData.partner || partnerData.name;
  }
  if (!partnerData.summary && (partnerData.description || partnerData.details)) {
    partnerData.summary = partnerData.description || partnerData.details || partnerData.name || "Strategic Partner";
  }
  if (!partnerData.description && partnerData.summary) {
    partnerData.description = partnerData.summary;
  }
  if (!partnerData.category) {
    partnerData.category = "Institutional";
  }

  if (req.file) {
    const uploadResult = await uploadBuffer(req.file.buffer, "vespera/partners", "image", req.file.originalname);
    partnerData.logo = uploadResult.url;
    partnerData.image = uploadResult.url;
  } else {
    if (partnerData.image && !partnerData.logo) partnerData.logo = partnerData.image;
    if (partnerData.logo && !partnerData.image) partnerData.image = partnerData.logo;
  }

  const partner = await Partner.create(partnerData);
  return sendSuccess(res, "Partner created successfully", { partner }, 201);
};

// @desc    Update partner (Admin)
// @route   PUT /api/partners/:id
// @access  Private (Admin)
const updatePartner = async (req, res) => {
  let updateData = { ...req.body };

  if (updateData.company && !updateData.partner) updateData.partner = updateData.company;
  if (updateData.partner && !updateData.company) updateData.company = updateData.partner;
  if (updateData.description && !updateData.summary) updateData.summary = updateData.description;
  if (updateData.summary && !updateData.description) updateData.description = updateData.summary;
  if (updateData.image && !updateData.logo) updateData.logo = updateData.image;
  if (updateData.logo && !updateData.image) updateData.image = updateData.logo;

  if (req.file) {
    const uploadResult = await uploadBuffer(req.file.buffer, "vespera/partners", "image", req.file.originalname);
    updateData.logo = uploadResult.url;
    updateData.image = uploadResult.url;
  }

  const partner = await Partner.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!partner) {
    return sendError(res, "Partner not found", 404);
  }

  return sendSuccess(res, "Partner updated successfully", { partner });
};

const PartnerRequest = require("../models/PartnerRequest");

// @desc    Submit public partner inquiry / proposal
// @route   POST /api/partners/inquiry
// @access  Public
const submitPartnerInquiry = async (req, res) => {
  const { companyName, contactName, email, phone, partnershipType, message } = req.body;

  if (!companyName || !companyName.trim()) {
    return sendError(res, "Company name is required", 400);
  }
  if (!contactName || !contactName.trim()) {
    return sendError(res, "Contact officer name is required", 400);
  }
  if (!email || !email.trim()) {
    return sendError(res, "Corporate email address is required", 400);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return sendError(res, "Please provide a valid corporate email address", 400);
  }
  if (!phone || !phone.trim()) {
    return sendError(res, "Phone number is required", 400);
  }
  if (!message || !message.trim()) {
    return sendError(res, "Proposal brief and scope is required", 400);
  }

  const inquiry = await PartnerRequest.create({
    companyName: companyName.trim(),
    contactName: contactName.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    partnershipType: (partnershipType || "MOU").trim(),
    message: message.trim(),
    submittedBy: req.user.id,
    status: "Pending",
  });

  return sendSuccess(res, "Your partnership request has been submitted successfully.", { inquiry }, 201);
};

// @desc    Get all partner requests (Admin)
// @route   GET /api/partners/requests
// @access  Private (Admin)
const getPartnerRequests = async (req, res) => {
  const requests = await PartnerRequest.find().sort({ createdAt: -1 });
  return sendSuccess(res, "Partner requests fetched", { requests });
};

// @desc    Update partner request status (Admin)
// @route   PATCH /api/partners/requests/:id/status
// @access  Private (Admin)
const updatePartnerRequestStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["Pending", "Reviewed", "Approved", "Rejected"];

  if (!status || !validStatuses.includes(status)) {
    return sendError(res, "Invalid status value provided", 400);
  }

  const requestItem = await PartnerRequest.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!requestItem) {
    return sendError(res, "Partner request not found", 404);
  }

  return sendSuccess(res, "Partner request status updated", { request: requestItem });
};

// @desc    Delete partner request (Admin)
// @route   DELETE /api/partners/requests/:id
// @access  Private (Admin)
const deletePartnerRequest = async (req, res) => {
  const requestItem = await PartnerRequest.findByIdAndDelete(req.params.id);
  if (!requestItem) {
    return sendError(res, "Partner request not found", 404);
  }
  return sendSuccess(res, "Partner request deleted successfully");
};

// @desc    Delete partner (Admin)
// @route   DELETE /api/partners/:id
// @access  Private (Admin)
const deletePartner = async (req, res) => {
  const partner = await Partner.findByIdAndDelete(req.params.id);
  if (!partner) {
    return sendError(res, "Partner not found", 404);
  }
  return sendSuccess(res, "Partner deleted successfully");
};

module.exports = {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  submitPartnerInquiry,
  getPartnerRequests,
  updatePartnerRequestStatus,
  deletePartnerRequest,
};
