const express = require("express");

const router = express.Router();

const {
    createAvailability,
    getMyAvailability,
    getTechnicianAvailability,
    updateAvailability,
    deleteAvailability
} = require("../controllers/availabilityController");

const verifyToken = require("../middleware/authMiddleware");


// =====================================================
// Create Availability
// Technician creates their availability
// =====================================================

router.post(
    "/create",
    verifyToken,
    createAvailability
);


// =====================================================
// Get My Availability
// Technician views their own availability
// =====================================================

router.get(
    "/my-availability",
    verifyToken,
    getMyAvailability
);


// =====================================================
// Get Technician Availability
// Public
// =====================================================

router.get(
    "/technician/:technicianId",
    getTechnicianAvailability
);


// =====================================================
// Update Availability
// Technician updates their own availability
// =====================================================

router.patch(
    "/:availabilityId",
    verifyToken,
    updateAvailability
);


// =====================================================
// Delete Availability
// Technician deletes their own availability
// =====================================================

router.delete(
    "/:availabilityId",
    verifyToken,
    deleteAvailability
);


module.exports = router;