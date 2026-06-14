const express = require("express");

const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");


const serviceRequestController =
require("../controllers/serviceRequestController");

router.post(
    "/",
    verifyToken,
    serviceRequestController.createServiceRequest
);

router.get(
    "/",
    serviceRequestController.getAllServiceRequests
);

router.get(
    "/:id",
    serviceRequestController.getServiceRequestById
);

router.get(
    "/client/:clientId",
    serviceRequestController.getClientRequests
);

router.get(
    "/technician/:technicianId",
    serviceRequestController.getTechnicianRequests
);

router.patch(
    "/:id/status",
    serviceRequestController.updateRequestStatus
);

module.exports = router;