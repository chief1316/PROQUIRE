const express = require("express");

const router = express.Router();
console.log("TECHNICIAN ROUTES FILE LOADED");

// Import technician controller functions
const {
    createProfile,
    getAllTechnicians,
    getTechnicianById,
    getMyProfile,
    updateMyProfile,
    getTechniciansByCategory,
    verifyTechnician,
    uploadVerificationDocument,
    getPendingTechnicians,
    getAIVerificationResults,
    reviewVerificationDocument
} = require("../controllers/technicianController");

// Middleware
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");


// ======================================================
// Create Technician Profile
// ======================================================

router.post(
    "/profile",
    verifyToken,
    createProfile
);


// ======================================================
// Get All Verified Technicians
// ======================================================

router.get(
    "/",
    getAllTechnicians
);


// ======================================================
// Get Technicians By Category
// ======================================================

router.get(
    "/category/:categoryId",
    getTechniciansByCategory
);


// ======================================================
// Get Logged-in Technician's Profile
// ======================================================

router.get(
    "/my-profile",
    verifyToken,
    getMyProfile
);

router.put(
    "/my-profile",
    verifyToken,
    updateMyProfile
);
console.log("PUT MY-PROFILE ROUTE REGISTERED");


// ======================================================
// Get Technician By ID
// ======================================================

router.get(
    "/:id",
    getTechnicianById
);


// ======================================================
// Verify Technician
// Admin Only
// ======================================================

router.patch(
    "/verify/:id",
    verifyToken,
    isAdmin,
    verifyTechnician
);


// ======================================================
// Upload Verification Document
// ======================================================

router.post(
    "/verification/upload",
    verifyToken,
    upload.single("document"),
    uploadVerificationDocument
);


// ======================================================
// Get Pending Technicians
// Admin Only
// ======================================================

router.get(
    "/pending/list",
    verifyToken,
    isAdmin,
    getPendingTechnicians
);


// ======================================================
// Get AI Verification Results
// Admin Only
// ======================================================

router.get(
    "/ai-verification/results",
    verifyToken,
    isAdmin,
    getAIVerificationResults
);


// ======================================================
// Admin Final Review of Verification Document
// ======================================================

router.patch(
    "/verification/review/:documentId",
    verifyToken,
    isAdmin,
    reviewVerificationDocument
);


// ======================================================
// Export Router
// ======================================================

module.exports = router;