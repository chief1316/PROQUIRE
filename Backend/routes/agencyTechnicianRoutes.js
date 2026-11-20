const express = require("express");

const router = express.Router();

const agencyTechnicianController =
require("../controllers/agencyTechnicianController");

const verifyToken =
require("../middleware/authMiddleware");


/*
|--------------------------------------------------------------------------
| Create Technician
|--------------------------------------------------------------------------
*/

router.post(
    "/",
    verifyToken,
    agencyTechnicianController.createTechnician
);


/*
|--------------------------------------------------------------------------
| Get All My Technicians
|--------------------------------------------------------------------------
*/

router.get(
    "/",
    verifyToken,
    agencyTechnicianController.getAgencyTechnicians
);

// Check whether an agency has a technician in a selected category
router.get(
    "/:agencyId/availability",
    agencyTechnicianController.checkAgencyCategoryAvailability
);


/*
|--------------------------------------------------------------------------
| Get One Technician
|--------------------------------------------------------------------------
*/

router.get(
    "/:id",
    verifyToken,
    agencyTechnicianController.getTechnicianById
);


/*
|--------------------------------------------------------------------------
| Update Technician
|--------------------------------------------------------------------------
*/

router.put(
    "/:id",
    verifyToken,
    agencyTechnicianController.updateTechnician
);


/*
|--------------------------------------------------------------------------
| Delete Technician
|--------------------------------------------------------------------------
*/

router.delete(
    "/:id",
    verifyToken,
    agencyTechnicianController.deleteTechnician
);


module.exports = router;