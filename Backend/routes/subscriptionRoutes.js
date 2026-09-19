const express = require("express");

const router = express.Router();

const {
    getPlans,
    subscribe,
    getMySubscription,
    cancelSubscription
} = require("../controllers/subscriptionController");

const verifyToken = require("../middleware/authMiddleware");


// =====================================================
// Get Available Subscription Plans
// =====================================================

router.get(
    "/plans",
    getPlans
);


// =====================================================
// Subscribe to a Plan
// =====================================================

router.post(
    "/subscribe",
    verifyToken,
    subscribe
);


// =====================================================
// Get My Subscription
// =====================================================

router.get(
    "/my-subscription",
    verifyToken,
    getMySubscription
);


// =====================================================
// Cancel My Subscription
// =====================================================

router.patch(
    "/cancel",
    verifyToken,
    cancelSubscription
);


module.exports = router;