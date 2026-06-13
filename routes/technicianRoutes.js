const express = require("express");

const router = express.Router();

const {
    addTechnicianProfile,
    getAllTechnicians,
    getTechnicianById,
    getTechniciansByCategory,
    verifyTechnician,
    uploadVerificationDocument
} = require("../controllers/technicianController");

const verifyToken = require("../middleware/authMiddleware");

const isAdmin = require("../middleware/adminMiddleware");


router.post(
    "/add",
    verifyToken,
    isAdmin,
    addTechnicianProfile
);

//adding route for getting all technicians
router.get(
  "/",
  getAllTechnicians
);

//adding route for getting technicians by category
router.get(
    "/category/:categoryId",
    getTechniciansByCategory
);

//adding route for getting technician by id
router.get(
    "/:id",
    getTechnicianById
);

//adding route for verifying technician
router.patch(
    "/verify/:id",
    verifyToken,
    isAdmin,
    verifyTechnician
);

//adding route for verification documents
router.post(
    "/verification/upload",
    uploadVerificationDocument
);


module.exports = router;