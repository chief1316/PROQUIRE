const db = require("../config/db");


// =====================================================
// Create Payment
// =====================================================

exports.createPayment = (req, res) => {

    const user_id = req.user.user_id;

    const {
        subscription_id,
        payment_method,
        transaction_reference
    } = req.body;


    // -------------------------------------------------
    // Validate required fields
    // -------------------------------------------------

    if (!subscription_id) {

        return res.status(400).json({
            message: "subscription_id is required."
        });

    }

    if (!payment_method) {

        return res.status(400).json({
            message: "payment_method is required."
        });

    }


    // =================================================
    // Check that the subscription belongs to the user
    // =================================================

    const subscriptionSql = `
        SELECT
            s.subscription_id,
            s.user_id,
            s.plan_id,
            s.status,
            p.plan_name,
            p.price
        FROM subscriptions s

        JOIN subscription_plans p
            ON s.plan_id = p.plan_id

        WHERE s.subscription_id = ?
        AND s.user_id = ?
    `;


    db.query(
        subscriptionSql,
        [
            subscription_id,
            user_id
        ],
        (err, subscriptions) => {

            if (err) {

                console.error(
                    "Error checking subscription:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to check subscription.",
                    error: err
                });

            }


            if (subscriptions.length === 0) {

                return res.status(404).json({
                    message:
                        "Subscription not found or does not belong to you."
                });

            }


            const subscription =
                subscriptions[0];


            // -----------------------------------------
            // Only active subscriptions can be paid
            // -----------------------------------------

            if (subscription.status !== "active") {

                return res.status(400).json({
                    message:
                        "Payment cannot be created for an inactive subscription.",
                    subscription_status:
                        subscription.status
                });

            }


            // =========================================
            // Create Payment
            // =========================================

            const insertPaymentSql = `
                INSERT INTO payments
                (
                    subscription_id,
                    amount,
                    payment_method,
                    transaction_reference,
                    payment_status
                )
                VALUES (?, ?, ?, ?, 'pending')
            `;


            db.query(
                insertPaymentSql,
                [
                    subscription.subscription_id,
                    subscription.price,
                    payment_method,
                    transaction_reference || null
                ],
                (err, result) => {

                    if (err) {

                        console.error(
                            "Error creating payment:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to create payment.",
                            error: err
                        });

                    }


                    res.status(201).json({

                        message:
                            "Payment created successfully.",

                        payment: {

                            payment_id:
                                result.insertId,

                            subscription_id:
                                subscription.subscription_id,

                            user_id:
                                user_id,

                            plan_name:
                                subscription.plan_name,

                            amount:
                                subscription.price,

                            payment_method:
                                payment_method,

                            transaction_reference:
                                transaction_reference || null,

                            payment_status:
                                "pending"

                        }

                    });

                }
            );

        }
    );

};



// =====================================================
// Get My Payments
// =====================================================

exports.getMyPayments = (req, res) => {

    const user_id = req.user.user_id;


    const sql = `
        SELECT

            pay.payment_id,

            pay.subscription_id,

            s.plan_id,

            sp.plan_name,

            pay.amount,

            pay.payment_method,

            pay.transaction_reference,

            pay.payment_status,

            pay.payment_date

        FROM payments pay

        JOIN subscriptions s
            ON pay.subscription_id = s.subscription_id

        JOIN subscription_plans sp
            ON s.plan_id = sp.plan_id

        WHERE s.user_id = ?

        ORDER BY pay.payment_id DESC
    `;


    db.query(
        sql,
        [user_id],
        (err, results) => {

            if (err) {

                console.error(
                    "Error fetching payments:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to fetch payments.",
                    error: err
                });

            }


            res.status(200).json(results);

        }
    );

};



// =====================================================
// Update Payment Status
// Admin Only
// =====================================================

exports.updatePaymentStatus = (req, res) => {

    // -------------------------------------------------
    // Make sure the logged-in user is an admin
    // -------------------------------------------------

    if (req.user.role !== "admin") {

        return res.status(403).json({
            message: "Access denied. Admins only."
        });

    }


    const {
        paymentId
    } = req.params;

    const {
        payment_status
    } = req.body;


    // -------------------------------------------------
    // Validate payment status
    // -------------------------------------------------

    const allowedStatuses = [
        "pending",
        "completed",
        "failed",
        "refunded"
    ];


    if (!payment_status) {

        return res.status(400).json({
            message:
                "payment_status is required."
        });

    }


    if (!allowedStatuses.includes(payment_status)) {

        return res.status(400).json({
            message:
                "Invalid payment status."
        });

    }


    // =================================================
    // Check that payment exists
    // =================================================

    const findPaymentSql = `
        SELECT
            pay.payment_id,
            pay.subscription_id,
            s.user_id,
            sp.plan_name,
            pay.amount,
            pay.payment_method,
            pay.transaction_reference,
            pay.payment_status
        FROM payments pay

        JOIN subscriptions s
            ON pay.subscription_id = s.subscription_id

        JOIN subscription_plans sp
            ON s.plan_id = sp.plan_id

        WHERE pay.payment_id = ?
    `;


    db.query(
        findPaymentSql,
        [paymentId],
        (err, payments) => {

            if (err) {

                console.error(
                    "Error finding payment:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to find payment.",
                    error: err
                });

            }


            if (payments.length === 0) {

                return res.status(404).json({
                    message:
                        "Payment not found."
                });

            }


            const payment =
                payments[0];


            // =========================================
            // Update payment status
            // =========================================

            const updateSql = `
                UPDATE payments

                SET payment_status = ?

                WHERE payment_id = ?
            `;


            db.query(
                updateSql,
                [
                    payment_status,
                    paymentId
                ],
                (err, result) => {

                    if (err) {

                        console.error(
                            "Error updating payment status:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to update payment status.",
                            error: err
                        });

                    }


                    res.status(200).json({

                        message:
                            "Payment status updated successfully.",

                        payment_id:
                            Number(paymentId),

                        subscription_id:
                            payment.subscription_id,

                        user_id:
                            payment.user_id,

                        plan_name:
                            payment.plan_name,

                        amount:
                            payment.amount,

                        previous_status:
                            payment.payment_status,

                        payment_status:
                            payment_status

                    });

                }
            );

        }
    );

};