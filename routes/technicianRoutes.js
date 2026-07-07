const express = require("express");

const router = express.Router();

const {
    createProfile,
    getAllTechnicians,
    getTechnicianById,
    getTechniciansByCategory,
    verifyTechnician,
    uploadVerificationDocument,
    getPendingTechnicians
} = require("../controllers/technicianController");

const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");


/*
|--------------------------------------------------------------------------
| Technician creates own profile
|--------------------------------------------------------------------------
*/

router.post(
    "/profile",
    verifyToken,
    createProfile
);


/*
|--------------------------------------------------------------------------
| Get all verified technicians
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    getAllTechnicians
);


/*
|--------------------------------------------------------------------------
| Get technicians by category
|--------------------------------------------------------------------------
*/

router.get(
    "/category/:categoryId",
    getTechniciansByCategory
);


/*
|--------------------------------------------------------------------------
| Get technician by ID
|--------------------------------------------------------------------------
*/

router.get(
    "/:id",
    getTechnicianById
);


/*
|--------------------------------------------------------------------------
| Admin verifies technician
|--------------------------------------------------------------------------
*/

router.patch(
    "/verify/:id",
    verifyToken,
    isAdmin,
    verifyTechnician
);


/*
|--------------------------------------------------------------------------
| Upload verification document
|--------------------------------------------------------------------------
*/

router.post(
    "/verification/upload",
    uploadVerificationDocument
);


/*
|--------------------------------------------------------------------------
| Admin gets pending technicians
|--------------------------------------------------------------------------
*/

router.get(
    "/pending/list",
    verifyToken,
    isAdmin,
    getPendingTechnicians
);


module.exports = router;