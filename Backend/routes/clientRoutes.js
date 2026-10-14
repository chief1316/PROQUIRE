const express = require("express");

const router = express.Router();


const {
    createClientProfile,
    getMyClientProfile,
    getClientProfileById,
    updateClientProfile,
    updateClientProfilePhoto,
    deleteClientProfile
} = require("../controllers/clientController");


const verifyToken = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");


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

router.post(
  "/profile/photo",
  verifyToken,
  upload.single("profile_photo"),
  updateClientProfilePhoto
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