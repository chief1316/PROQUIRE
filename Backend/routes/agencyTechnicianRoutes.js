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