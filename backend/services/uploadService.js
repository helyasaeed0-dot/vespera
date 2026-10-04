const { cloudinary } = require("../config/cloudinary");
const config = require("../config/env");
const logger = require("../utils/logger");

/**
 * Upload a memory buffer to Cloudinary
 * @param {Buffer} buffer
 * @param {string} folder
 * @param {string} resourceType - "image" | "raw" | "auto"
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const fs = require("fs");
const path = require("path");

const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Upload a memory buffer to Cloudinary or fallback to local uploads directory
 * @param {Buffer} buffer
 * @param {string} folder
 * @param {string} resourceType - "image" | "raw" | "auto"
 * @param {string} originalName - optional original filename
 * @returns {Promise<{ url: string, publicId: string }>}
 */
const uploadBuffer = (buffer, folder = "vespera", resourceType = "auto", originalName = "") => {
  return new Promise((resolve, reject) => {
    // If Cloudinary credentials are configured, use Cloudinary
    if (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET) {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) {
            logger.warn("Cloudinary upload failed, falling back to local file storage", { error: error.message });
            saveLocally(buffer, originalName, resolve, reject);
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          }
        }
      );
      uploadStream.end(buffer);
    } else {
      saveLocally(buffer, originalName, resolve, reject);
    }
  });
};

function saveLocally(buffer, originalName, resolve, reject) {
  try {
    const ext = originalName ? path.extname(originalName) : ".jpg";
    const fileName = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    const serverUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const fileUrl = `${serverUrl}/uploads/${fileName}`;
    logger.info(`Asset stored locally at ${fileUrl}`);
    resolve({
      url: fileUrl,
      publicId: fileName,
    });
  } catch (err) {
    logger.error("Failed to save asset locally", { error: err.message });
    reject(err);
  }
}

module.exports = {
  uploadBuffer,
};
