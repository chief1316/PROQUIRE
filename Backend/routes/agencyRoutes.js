const express = require("express");

const router = express.Router();

const agencyController = require("../controllers/agencyController");

const verifyToken = require("../middleware/authMiddleware");

const isAdmin = require("../middleware/adminMiddleware");

const upload = require("../middleware/uploadMiddleware");


// ==========================================================
// Create agency profile
// ==========================================================

router.post(
    "/",
    verifyToken,
    upload.single("logo"),
    agencyController.createAgency
);


// ==========================================================
// Get all agencies
// ==========================================================

router.get(
    "/",
    agencyController.getAllAgencies
);


// ==========================================================
// Get logged-in agency
// ==========================================================

router.get(
    "/me",
    verifyToken,
    agencyController.getMyAgency
);


// ==========================================================
// Get pending agencies
// ADMIN ONLY
// ==========================================================

router.get(
    "/pending/list",
    verifyToken,
    isAdmin,
    agencyController.getPendingAgencies
);


// ==========================================================
// Verify agency
// ADMIN ONLY
// ==========================================================

router.patch(
    "/verify/:id",
    verifyToken,
    isAdmin,
    agencyController.verifyAgency
);


// ==========================================================
// Get agency by ID
// ==========================================================

router.get(
    "/:id",
    agencyController.getAgencyById
);


// ==========================================================
// Update agency
// ==========================================================

router.put(
    "/:id",
    verifyToken,
    upload.single("logo"),
    agencyController.updateAgency
);


// ==========================================================
// Delete agency
// ==========================================================

router.delete(
    "/:id",
    verifyToken,
    agencyController.deleteAgency
);


module.exports = router;