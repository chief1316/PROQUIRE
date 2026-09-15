const express = require("express");

const router = express.Router();

const {

    createProfile,

    getAllTechnicians,

    getTechnicianById,

    getTechniciansByCategory,

    verifyTechnician,

    uploadVerificationDocument,

    getPendingTechnicians,

    getAIVerificationResults,

    reviewVerificationDocument

} = require("../controllers/technicianController");

const verifyToken = require("../middleware/authMiddleware");

const isAdmin = require("../middleware/adminMiddleware");

const upload = require("../middleware/uploadMiddleware");


// =========================

// Create Technician Profile

// =========================

router.post(

    "/profile",

    verifyToken,

    createProfile

);


// =========================

// Get All Verified Technicians

// =========================

router.get(

    "/",

    getAllTechnicians

);


// =========================

// Get Technicians By Category

// =========================

router.get(

    "/category/:categoryId",

    getTechniciansByCategory

);


// =========================

// Get Technician By ID

// =========================

router.get(

    "/:id",

    getTechnicianById

);


// =========================

// Verify Technician

// Admin Only

// =========================

router.patch(

    "/verify/:id",

    verifyToken,

    isAdmin,

    verifyTechnician

);


// =========================

// Upload Verification Document

// =========================

router.post(

    "/verification/upload",

    verifyToken,

    upload.single("document"),

    uploadVerificationDocument

);


// =========================

// Get Pending Technicians

// Admin Only

// =========================

router.get(

    "/pending/list",

    verifyToken,

    isAdmin,

    getPendingTechnicians

);


// =========================

// Get AI Verification Results

// Admin Only

// =========================

router.get(

    "/ai-verification/results",

    verifyToken,

    isAdmin,

    getAIVerificationResults

);


// =========================

// Admin Final Review

// Admin Only

// =========================

router.patch(

    "/verification/review/:documentId",

    verifyToken,

    isAdmin,

    reviewVerificationDocument

);


module.exports = router;