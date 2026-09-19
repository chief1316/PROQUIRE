const express = require("express");

const router = express.Router();

const {
    createPayment,
    getMyPayments,
    updatePaymentStatus
} = require("../controllers/paymentController");

const verifyToken = require("../middleware/authMiddleware");

const isAdmin = require("../middleware/adminMiddleware");


// =====================================================
// Create Payment
// User creates a payment for their subscription
// =====================================================

router.post(
    "/create",
    verifyToken,
    createPayment
);


// =====================================================
// Get My Payments
// User views their own payment history
// =====================================================

router.get(
    "/my-payments",
    verifyToken,
    getMyPayments
);


// =====================================================
// Update Payment Status
// Admin Only
// =====================================================

router.patch(
    "/status/:paymentId",
    verifyToken,
    isAdmin,
    updatePaymentStatus
);


module.exports = router;