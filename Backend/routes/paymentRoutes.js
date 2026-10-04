const express = require("express");

const router = express.Router();

const {
    createPayment,
    getMyPayments,
    updatePaymentStatus,
    initiateMpesaStkPush,
    mpesaCallback
} = require("../controllers/paymentController");

const verifyToken =
    require("../middleware/authMiddleware");

const isAdmin =
    require("../middleware/adminMiddleware");


// =====================================================
// Regular Payment Routes
// =====================================================

router.post(
    "/create",
    verifyToken,
    createPayment
);

router.get(
    "/my-payments",
    verifyToken,
    getMyPayments
);


// =====================================================
// M-Pesa STK Push
// =====================================================

// Starts an M-Pesa payment request.
// Requires the logged-in user's JWT.

router.post(
    "/mpesa/stkpush",
    verifyToken,
    initiateMpesaStkPush
);


// =====================================================
// M-Pesa Callback
// =====================================================

// Safaricom calls this endpoint.
// DO NOT add verifyToken here.

router.post(
    "/mpesa/callback",
    mpesaCallback
);


// =====================================================
// Admin Payment Status
// =====================================================

router.patch(
    "/status/:paymentId",
    verifyToken,
    isAdmin,
    updatePaymentStatus
);


module.exports = router;