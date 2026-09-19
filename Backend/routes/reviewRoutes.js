const express = require("express");

const router = express.Router();

const reviewController =
require("../controllers/reviewController");
const verifyToken = require("../middleware/authMiddleware");

router.post(
    "/",
    verifyToken,
    reviewController.createReview
);

router.get(
    "/technician/:technicianId",
    reviewController.getTechnicianReviews
);

router.get(
    "/technician/:technicianId/rating",
    reviewController.getAverageRating
);

router.get(
    "/technician/:id/average",
    reviewController.getAverageRating
);

module.exports = router;