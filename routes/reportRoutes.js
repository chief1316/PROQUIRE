const express = require("express");

const router = express.Router();

const {
    createReport,
    getMyReports,
    getAllReports,
    updateReportStatus
} = require("../controllers/reportController");

const verifyToken = require("../middleware/authMiddleware");

const isAdmin = require("../middleware/adminMiddleware");


// =====================================================
// Create Report
// User reports another user
// =====================================================

router.post(
    "/create",
    verifyToken,
    createReport
);


// =====================================================
// Get My Reports
// User views reports they have submitted
// =====================================================

router.get(
    "/my-reports",
    verifyToken,
    getMyReports
);


// =====================================================
// Get All Reports
// Admin Only
// =====================================================

router.get(
    "/",
    verifyToken,
    isAdmin,
    getAllReports
);


// =====================================================
// Update Report Status
// Admin Only
// =====================================================

router.patch(
    "/status/:reportId",
    verifyToken,
    isAdmin,
    updateReportStatus
);


module.exports = router;