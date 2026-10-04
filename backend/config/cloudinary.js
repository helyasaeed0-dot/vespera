const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const config = require("./env");

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.CLOUDINARY_CLOUD_NAME,
  api_key: config.CLOUDINARY_API_KEY,
  api_secret: config.CLOUDINARY_API_SECRET,
  secure: true,
});

// Configure Multer in-memory storage
const storage = multer.memoryStorage();

// File filter for images (JPEG, PNG, WEBP, AVIF)
const imageFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/jpg"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, and AVIF images are allowed."), false);
  }
};

// File filter for documents (PDF, DOCX, DOC)
const documentFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid document type. Only PDF and DOCX files are allowed."), false);
  }
};

const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: imageFilter,
});

const uploadDocument = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: documentFilter,
});

module.exports = {
  cloudinary,
  uploadImage,
  uploadDocument,
};
