const User = require("../models/User");
const Order = require("../models/Order");
const JobApplication = require("../models/JobApplication");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return sendError(res, "User not found", 404);
  return sendSuccess(res, "Profile fetched", { user });
};

// @desc    Update user profile
// @route   PATCH /api/users/me
// @access  Private
const updateUserProfile = async (req, res) => {
  const { name, phone } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    return sendError(res, "User not found", 404);
  }

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();

  await user.save();

  return sendSuccess(res, "Profile updated successfully", { user });
};

// @desc    Change user password
// @route   PATCH /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return sendError(res, "New password must be at least 6 characters long", 400);
  }

  const user = await User.findById(req.user.id).select("+password");

  // If user has a password set, verify it
  if (user.password) {
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendError(res, "Incorrect current password", 400);
    }
  }

  user.password = newPassword;
  await user.save();

  return sendSuccess(res, "Password updated successfully");
};

// @desc    Get logged in user orders
// @route   GET /api/users/me/orders
// @access  Private
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  return sendSuccess(res, "User orders fetched", { orders });
};

// @desc    Get logged in user applications
// @route   GET /api/users/me/applications
// @access  Private
const getMyApplications = async (req, res) => {
  const applications = await JobApplication.find({
    $or: [{ user: req.user.id }, { email: req.user.email }],
  })
    .populate("job", "title department location type")
    .sort({ createdAt: -1 });

  return sendSuccess(res, "User applications fetched", { applications });
};

// ============================================================
// ADDRESS BOOK CRUD
// ============================================================

// @desc    Get all addresses for logged in user
// @route   GET /api/users/me/addresses
// @access  Private
const getAddresses = async (req, res) => {
  const user = await User.findById(req.user.id).select("addresses");
  if (!user) return sendError(res, "User not found", 404);
  return sendSuccess(res, "Addresses fetched", { addresses: user.addresses || [] });
};

// @desc    Add a new address
// @route   POST /api/users/me/addresses
// @access  Private
const addAddress = async (req, res) => {
  const { label, fullName, phone, street, city, state, postalCode, country, isDefault } = req.body;

  if (!fullName || !street || !city || !country) {
    return sendError(res, "Full name, street, city and country are required", 400);
  }

  const user = await User.findById(req.user.id);
  if (!user) return sendError(res, "User not found", 404);

  // If setting as default, clear other defaults
  if (isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }

  user.addresses.push({ label: label || "Home", fullName, phone: phone || "", street, city, state: state || "", postalCode: postalCode || "", country, isDefault: Boolean(isDefault) });
  await user.save();

  const newAddress = user.addresses[user.addresses.length - 1];
  return sendSuccess(res, "Address added successfully", { address: newAddress }, 201);
};

// @desc    Update an address
// @route   PUT /api/users/me/addresses/:addressId
// @access  Private
const updateAddress = async (req, res) => {
  const { addressId } = req.params;
  const { label, fullName, phone, street, city, state, postalCode, country, isDefault } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return sendError(res, "User not found", 404);

  const address = user.addresses.id(addressId);
  if (!address) return sendError(res, "Address not found", 404);

  // If setting as default, clear other defaults
  if (isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }

  if (label !== undefined) address.label = label;
  if (fullName !== undefined) address.fullName = fullName;
  if (phone !== undefined) address.phone = phone;
  if (street !== undefined) address.street = street;
  if (city !== undefined) address.city = city;
  if (state !== undefined) address.state = state;
  if (postalCode !== undefined) address.postalCode = postalCode;
  if (country !== undefined) address.country = country;
  if (isDefault !== undefined) address.isDefault = Boolean(isDefault);

  await user.save();
  return sendSuccess(res, "Address updated successfully", { address });
};

// @desc    Delete an address
// @route   DELETE /api/users/me/addresses/:addressId
// @access  Private
const deleteAddress = async (req, res) => {
  const { addressId } = req.params;

  const user = await User.findById(req.user.id);
  if (!user) return sendError(res, "User not found", 404);

  const address = user.addresses.id(addressId);
  if (!address) return sendError(res, "Address not found", 404);

  user.addresses.pull(addressId);
  await user.save();

  return sendSuccess(res, "Address deleted successfully");
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getMyOrders,
  getMyApplications,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
