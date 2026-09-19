const express = require("express");

const router = express.Router();

const {
    createClientProfile,
    getMyClientProfile,
    getClientProfileById,
    updateClientProfile,
    deleteClientProfile
} = require("../controllers/clientController");

const verifyToken = require("../middleware/authMiddleware");


// =====================================================
// Create Client Profile
// =====================================================

router.post(
    "/profile",
    verifyToken,
    createClientProfile
);


// =====================================================
// Get My Client Profile
// =====================================================

router.get(
    "/my-profile",
    verifyToken,
    getMyClientProfile
);


// =====================================================
// Get Client Profile By ID
// Public
// =====================================================

router.get(
    "/:clientId",
    getClientProfileById
);


// =====================================================
// Update Client Profile
// =====================================================

router.patch(
    "/profile",
    verifyToken,
    updateClientProfile
);


// =====================================================
// Delete Client Profile
// =====================================================

router.delete(
    "/profile",
    verifyToken,
    deleteClientProfile
);


module.exports = router;