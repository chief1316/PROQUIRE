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

// Get requests belonging to the logged-in client
router.get(
    "/my-requests",
    verifyToken,
    serviceRequestController.getMyRequests
);

// Get requests belonging to the logged-in agency
router.get(
    "/agency/my-requests",
    verifyToken,
    serviceRequestController.getMyAgencyRequests
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
    verifyToken,
    serviceRequestController.updateRequestStatus
);

// Agency accepts or rejects an agency service request
router.patch(
    "/agency/:id/status",
    verifyToken,
    serviceRequestController.updateAgencyRequestStatus
);

// Agency assigns one of its technicians to an accepted request
router.patch(
    "/agency/:id/assign-technician",
    verifyToken,
    serviceRequestController.assignAgencyTechnician
);

// Mark an accepted service request as completed
router.patch(
    "/:id/complete",
    verifyToken,
    serviceRequestController.completeRequest
);

module.exports = router;