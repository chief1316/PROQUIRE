const express = require("express");

const router = express.Router();

const agencyController = require("../controllers/agencyController");

const verifyToken = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");


// =========================
// Create agency profile
// =========================
router.post(
    "/",
    verifyToken,
    upload.single("logo"),
    agencyController.createAgency
);


// =========================
// Get all agencies
// =========================

router.get(
    "/",
    agencyController.getAllAgencies
);


// =========================
// Get logged in agency
// =========================
router.get(
    "/me",
    verifyToken,
    agencyController.getMyAgency
);


// =========================
// Get agency by ID
// =========================
router.get(
    "/:id",
    agencyController.getAgencyById
);


// =========================
// Update logged in agency
// =========================
router.put(
    "/:id",
    verifyToken,
    upload.single("logo"),
    agencyController.updateAgency
);


// =========================
// Delete agency by ID
// =========================
router.delete(
    "/:id",
    verifyToken,
    agencyController.deleteAgency
);

module.exports = router;