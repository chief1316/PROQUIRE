const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ======================================================
// EXISTING DISK STORAGE
// Keep this for existing uploads.
// ======================================================

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/";

    if (file.fieldname === "logo") {
      folder = "uploads/agency_logos/";
    } else if (file.fieldname === "profile_photo") {
      folder = "uploads/profile_photos/";
    } else if (file.fieldname === "portfolio_image") {
      folder = "uploads/portfolios/";
    } else if (file.fieldname === "document") {
      folder = "uploads/documents/";
    } else if (file.fieldname === "selfie") {
      folder = "uploads/verification_selfies/";
    }

    fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// ======================================================
// FILE VALIDATION
// Preserve existing file restrictions.
// ======================================================

const fileFilter = (req, file, cb) => {
  // Verification documents must be PDF only.
  if (file.fieldname === "document") {
    const extension = path.extname(file.originalname).toLowerCase();

    if (file.mimetype === "application/pdf" && extension === ".pdf") {
      return cb(null, true);
    }

    return cb(
      new Error("Verification documents must be uploaded as PDF files only."),
    );
  }

  // Verification selfies must be images.
  if (file.fieldname === "selfie") {
    const allowedSelfieTypes = ["image/jpeg", "image/png", "image/webp"];

    if (allowedSelfieTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error("Selfie must be a JPG, PNG or WEBP image."));
  }

  // Other existing uploads.
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",

    "application/pdf",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only JPG, JPEG, PNG, WEBP, PDF, DOC and DOCX files are allowed.",
    ),
  );
};

// ======================================================
// SHARED UPLOAD LIMITS
// ======================================================

const uploadLimits = {
  fileSize: 10 * 1024 * 1024,
};

// ======================================================
// EXISTING UPLOAD MIDDLEWARE
// Disk storage remains unchanged.
// ======================================================

const upload = multer({
  storage: diskStorage,

  fileFilter,

  limits: uploadLimits,
});

// ======================================================
// NEW MEMORY STORAGE
// For files that will be uploaded to Supabase.
// ======================================================

const memoryStorage = multer.memoryStorage();

const uploadMemory = multer({
  storage: memoryStorage,

  fileFilter,

  limits: uploadLimits,
});

// ======================================================
// EXPORT
// Preserve existing imports throughout ProQuire.
// ======================================================

module.exports = upload;

// Add memory upload as an additional property.
module.exports.uploadMemory = uploadMemory;
