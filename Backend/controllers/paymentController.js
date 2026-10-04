const db = require("../config/db");


// =====================================================
// Helper: Normalize Kenyan Phone Number
// =====================================================

const normalizePhoneNumber = (phone) => {

    if (!phone) {
        return null;
    }

    let normalized = String(phone).trim();

    if (normalized.startsWith("+")) {
        normalized = normalized.substring(1);
    }

    if (normalized.startsWith("0")) {
        normalized = "254" + normalized.substring(1);
    }

    if (normalized.startsWith("7")) {
        normalized = "254" + normalized;
    }

    return normalized;

};


// =====================================================
// Helper: Activate Subscription After Successful Payment
// =====================================================

const activateSubscription = (
    subscriptionId,
    durationDays,
    callback
) => {
    const getSubscriptionSql = `
        SELECT
            subscription_id,
            user_id,
            plan_id
        FROM subscriptions
        WHERE subscription_id = ?
        AND status = 'pending'
    `;

    db.query(
        getSubscriptionSql,
        [subscriptionId],
        (err, subscriptions) => {
            if (err) {
                console.error(
                    "Error finding pending subscription:",
                    err
                );

                return callback(err);
            }

            if (subscriptions.length === 0) {
                return callback(
                    new Error(
                        "Pending subscription not found."
                    )
                );
            }

            const subscription =
                subscriptions[0];

            const activateSql = `
                UPDATE subscriptions
                SET
                    status = 'active',
                    start_date = CURDATE(),
                    end_date = DATE_ADD(
                        CURDATE(),
                        INTERVAL ? DAY
                    )
                WHERE subscription_id = ?
                AND status = 'pending'
            `;

            db.query(
                activateSql,
                [
                    durationDays,
                    subscriptionId
                ],
                (err, result) => {
                    if (err) {
                        console.error(
                            "Error activating subscription:",
                            err
                        );

                        return callback(err);
                    }

                    if (result.affectedRows === 0) {
                        return callback(
                            new Error(
                                "Subscription could not be activated."
                            )
                        );
                    }

                    const cancelPreviousSql = `
                        UPDATE subscriptions
                        SET status = 'cancelled'
                        WHERE user_id = ?
                        AND subscription_id <> ?
                        AND status = 'active'
                    `;

                    db.query(
                        cancelPreviousSql,
                        [
                            subscription.user_id,
                            subscriptionId
                        ],
                        (err) => {
                            if (err) {
                                console.error(
                                    "Error cancelling previous subscription:",
                                    err
                                );

                                return callback(err);
                            }

                            callback(null, {
                                activatedSubscriptionId:
                                    subscriptionId,
                                cancelledPreviousSubscriptions:
                                    true
                            });
                        }
                    );
                }
            );
        }
    );
};


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
                    message:
                        "Failed to check subscription.",
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


            if (subscription.status !== "pending") {

                return res.status(400).json({
                    message:
                        "Payment can only be created for a pending subscription.",
                    subscription_status:
                        subscription.status
                });

            }


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
// Initiate M-Pesa STK Push
// =====================================================

exports.initiateMpesaStkPush = async (req, res) => {

    const user_id = req.user.user_id;

    const {
        subscription_id,
        phone_number
    } = req.body;


    if (!subscription_id) {

        return res.status(400).json({
            message:
                "subscription_id is required."
        });

    }


    if (!phone_number) {

        return res.status(400).json({
            message:
                "phone_number is required."
        });

    }


    const phoneNumber =
        normalizePhoneNumber(phone_number);


    if (
        !phoneNumber ||
        !/^254[17]\d{8}$/.test(phoneNumber)
    ) {

        return res.status(400).json({
            message:
                "Please provide a valid Kenyan mobile phone number."
        });

    }


    const subscriptionSql = `
        SELECT
            s.subscription_id,
            s.user_id,
            s.plan_id,
            s.status,
            p.plan_name,
            p.price,
            p.duration_days
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
        async (err, subscriptions) => {

            if (err) {

                console.error(
                    "Error checking subscription for M-Pesa:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to check subscription.",
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


            if (subscription.status !== "pending") {

                return res.status(400).json({
                    message:
                        "M-Pesa payment can only be initiated for a pending subscription.",
                    subscription_status:
                        subscription.status
                });

            }


            const existingPaymentSql = `
                SELECT
                    payment_id,
                    payment_status,
                    checkout_request_id
                FROM payments
                WHERE subscription_id = ?
                AND payment_method = 'mpesa'
                AND payment_status = 'pending'
                ORDER BY payment_id DESC
                LIMIT 1
            `;


            db.query(
                existingPaymentSql,
                [subscription.subscription_id],
                async (err, existingPayments) => {

                    if (err) {

                        console.error(
                            "Error checking existing M-Pesa payment:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to check existing payment.",
                            error: err
                        });

                    }


                    if (existingPayments.length > 0) {

                        return res.status(409).json({
                            message:
                                "There is already a pending M-Pesa payment for this subscription.",
                            payment:
                                existingPayments[0]
                        });

                    }


                    try {

                        // =================================================
                        // Get M-Pesa OAuth Access Token
                        // =================================================

                        const consumerKey =
                            process.env.MPESA_CONSUMER_KEY;

                        const consumerSecret =
                            process.env.MPESA_CONSUMER_SECRET;


                        if (
                            !consumerKey ||
                            !consumerSecret
                        ) {

                            console.error(
                                "M-Pesa Consumer Key or Consumer Secret is missing."
                            );

                            return res.status(500).json({
                                message:
                                    "M-Pesa configuration is incomplete."
                            });

                        }


                        const credentials = Buffer
                            .from(
                                `${consumerKey}:${consumerSecret}`
                            )
                            .toString("base64");


                        const tokenResponse =
                            await fetch(
                                "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
                                {
                                    method: "GET",
                                    headers: {
                                        Authorization:
                                            `Basic ${credentials}`
                                    }
                                }
                            );


                        const tokenData =
                            await tokenResponse.json();


                        if (
                            !tokenResponse.ok ||
                            !tokenData.access_token
                        ) {

                            console.error(
                                "M-Pesa OAuth error:",
                                tokenData
                            );

                            return res.status(502).json({
                                message:
                                    "Unable to obtain M-Pesa access token.",
                                error:
                                    tokenData
                            });

                        }


                        const accessToken =
                            tokenData.access_token;


                        // =================================================
                        // Generate Timestamp
                        // =================================================

                        const now =
                            new Date();

                        const year =
                            now.getFullYear();

                        const month =
                            String(
                                now.getMonth() + 1
                            ).padStart(
                                2,
                                "0"
                            );

                        const day =
                            String(
                                now.getDate()
                            ).padStart(
                                2,
                                "0"
                            );

                        const hours =
                            String(
                                now.getHours()
                            ).padStart(
                                2,
                                "0"
                            );

                        const minutes =
                            String(
                                now.getMinutes()
                            ).padStart(
                                2,
                                "0"
                            );

                        const seconds =
                            String(
                                now.getSeconds()
                            ).padStart(
                                2,
                                "0"
                            );


                        const timestamp =
                            `${year}${month}${day}${hours}${minutes}${seconds}`;


                        // =================================================
                        // Generate M-Pesa Password
                        // =================================================

                        const shortcode =
                            process.env.MPESA_SHORTCODE;

                        const passkey =
                            process.env.MPESA_PASSKEY;


                        if (
                            !shortcode ||
                            !passkey
                        ) {

                            console.error(
                                "M-Pesa Shortcode or Passkey is missing."
                            );

                            return res.status(500).json({
                                message:
                                    "M-Pesa configuration is incomplete."
                            });

                        }


                        const password =
                            Buffer
                                .from(
                                    `${shortcode}${passkey}${timestamp}`
                                )
                                .toString("base64");


                        // =================================================
                        // Create Pending Payment Record
                        // =================================================

                        const paymentId =
                            await new Promise(
                                (resolve, reject) => {

                                    const insertPaymentSql = `
                                        INSERT INTO payments
                                        (
                                            subscription_id,
                                            amount,
                                            payment_method,
                                            transaction_reference,
                                            payment_status
                                        )
                                        VALUES (?, ?, 'mpesa', NULL, 'pending')
                                    `;


                                    db.query(
                                        insertPaymentSql,
                                        [
                                            subscription.subscription_id,
                                            subscription.price
                                        ],
                                        (err, result) => {

                                            if (err) {
                                                return reject(err);
                                            }

                                            resolve(
                                                result.insertId
                                            );

                                        }
                                    );

                                }
                            );


                        // =================================================
                        // Send STK Push to Safaricom
                        // =================================================

                        const amount =
                            Math.round(
                                Number(
                                    subscription.price
                                )
                            );


                        const stkPayload = {

                            BusinessShortCode:
                                shortcode,

                            Password:
                                password,

                            Timestamp:
                                timestamp,

                            TransactionType:
                                "CustomerPayBillOnline",

                            Amount:
                                amount,

                            PartyA:
                                phoneNumber,

                            PartyB:
                                shortcode,

                            PhoneNumber:
                                phoneNumber,

                            CallBackURL:
                                process.env.MPESA_CALLBACK_URL,

                            AccountReference:
                                `PROQUIRE-${subscription.subscription_id}`,

                            TransactionDesc:
                                `ProQuire ${subscription.plan_name} Subscription`

                        };


                        const stkResponse =
                            await fetch(
                                "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
                                {
                                    method: "POST",

                                    headers: {
                                        Authorization:
                                            `Bearer ${accessToken}`,

                                        "Content-Type":
                                            "application/json"
                                    },

                                    body:
                                        JSON.stringify(
                                            stkPayload
                                        )
                                }
                            );


                        const stkData =
                            await stkResponse.json();


                        if (
                            !stkResponse.ok ||
                            !stkData.CheckoutRequestID
                        ) {

                            console.error(
                                "M-Pesa STK Push error:",
                                stkData
                            );


                            await new Promise(
                                (resolve) => {

                                    const updateFailedSql = `
                                        UPDATE payments
                                        SET payment_status = 'failed'
                                        WHERE payment_id = ?
                                    `;

                                    db.query(
                                        updateFailedSql,
                                        [paymentId],
                                        () => resolve()
                                    );

                                }
                            );


                            return res.status(502).json({
                                message:
                                    "M-Pesa STK Push could not be initiated.",
                                error:
                                    stkData
                            });

                        }


                        // =================================================
                        // Save M-Pesa Request IDs
                        // =================================================

                        const updatePaymentSql = `
                            UPDATE payments

                            SET
                                transaction_reference = ?,
                                merchant_request_id = ?,
                                checkout_request_id = ?

                            WHERE payment_id = ?
                        `;


                        db.query(
                            updatePaymentSql,
                            [
                                stkData.CheckoutRequestID,
                                stkData.MerchantRequestID || null,
                                stkData.CheckoutRequestID,
                                paymentId
                            ],
                            (err) => {

                                if (err) {

                                    console.error(
                                        "Error saving M-Pesa request IDs:",
                                        err
                                    );

                                    return res.status(500).json({
                                        message:
                                            "STK Push was initiated, but the payment record could not be updated.",
                                        error:
                                            err
                                    });

                                }


                                return res.status(200).json({

                                    message:
                                        "M-Pesa payment request sent successfully. Please check your phone and enter your M-Pesa PIN.",

                                    payment: {

                                        payment_id:
                                            paymentId,

                                        subscription_id:
                                            subscription.subscription_id,

                                        plan_name:
                                            subscription.plan_name,

                                        amount:
                                            subscription.price,

                                        phone_number:
                                            phoneNumber,

                                        payment_status:
                                            "pending",

                                        merchant_request_id:
                                            stkData.MerchantRequestID,

                                        checkout_request_id:
                                            stkData.CheckoutRequestID

                                    },

                                    mpesa: {

                                        response_code:
                                            stkData.ResponseCode,

                                        response_description:
                                            stkData.ResponseDescription,

                                        customer_message:
                                            stkData.CustomerMessage

                                    }

                                });

                            }
                        );

                    } catch (error) {

                        console.error(
                            "M-Pesa STK Push error:",
                            error
                        );

                        return res.status(500).json({
                            message:
                                "Failed to initiate M-Pesa payment.",
                            error:
                                error.message
                        });

                    }

                }
            );

        }
    );

};


// =====================================================
// M-Pesa STK Callback
// =====================================================

exports.mpesaCallback = (req, res) => {

    console.log(
        "M-Pesa callback received:"
    );

    console.log(
        JSON.stringify(
            req.body,
            null,
            2
        )
    );


    // Safaricom expects a successful HTTP response.
    // We acknowledge the callback even if processing fails later.

    const stkCallback =
        req.body?.Body?.stkCallback;


    if (!stkCallback) {

        console.error(
            "Invalid M-Pesa callback payload."
        );

        return res.status(200).json({
            ResultCode: 0,
            ResultDesc: "Callback received."
        });

    }


    const checkoutRequestId =
        stkCallback.CheckoutRequestID;

    const merchantRequestId =
        stkCallback.MerchantRequestID;

    const resultCode =
        Number(
            stkCallback.ResultCode
        );

    const resultDesc =
        stkCallback.ResultDesc;


    if (!checkoutRequestId) {

        console.error(
            "M-Pesa callback is missing CheckoutRequestID."
        );

        return res.status(200).json({
            ResultCode: 0,
            ResultDesc: "Callback received."
        });

    }


    const findPaymentSql = `
        SELECT

            pay.payment_id,
            pay.subscription_id,
            pay.amount,
            pay.payment_status,

            s.user_id,
            s.plan_id,
            s.status AS subscription_status,

            sp.plan_name,
            sp.duration_days

        FROM payments pay

        JOIN subscriptions s
            ON pay.subscription_id =
               s.subscription_id

        JOIN subscription_plans sp
            ON s.plan_id =
               sp.plan_id

        WHERE pay.checkout_request_id = ?

        LIMIT 1
    `;


    db.query(
        findPaymentSql,
        [checkoutRequestId],
        (err, payments) => {

            if (err) {

                console.error(
                    "Error finding M-Pesa payment:",
                    err
                );

                return res.status(200).json({
                    ResultCode: 0,
                    ResultDesc: "Callback received."
                });

            }


            if (payments.length === 0) {

                console.error(
                    "No payment found for CheckoutRequestID:",
                    checkoutRequestId
                );

                return res.status(200).json({
                    ResultCode: 0,
                    ResultDesc: "Callback received."
                });

            }


            const payment =
                payments[0];


            // =================================================
            // Successful Payment
            // =================================================

            if (resultCode === 0) {

                let mpesaReceiptNumber =
                    null;

                let transactionDate =
                    null;

                let callbackPhoneNumber =
                    null;

                let callbackAmount =
                    null;


                const metadata =
                    stkCallback.CallbackMetadata?.Item ||
                    [];


                metadata.forEach(
                    (item) => {

                        if (
                            item.Name ===
                            "MpesaReceiptNumber"
                        ) {
                            mpesaReceiptNumber =
                                item.Value;
                        }

                        if (
                            item.Name ===
                            "TransactionDate"
                        ) {
                            transactionDate =
                                item.Value;
                        }

                        if (
                            item.Name ===
                            "PhoneNumber"
                        ) {
                            callbackPhoneNumber =
                                item.Value;
                        }

                        if (
                            item.Name ===
                            "Amount"
                        ) {
                            callbackAmount =
                                item.Value;
                        }

                    }
                );


                // =================================================
                // Start MySQL Transaction
                // =================================================

                db.beginTransaction(
                    (err) => {

                        if (err) {

                            console.error(
                                "Error starting M-Pesa transaction:",
                                err
                            );

                            return res.status(200).json({
                                ResultCode: 0,
                                ResultDesc:
                                    "Callback received."
                            });

                        }


                        // =================================================
                        // Complete Payment
                        // =================================================

                        const updatePaymentSql = `
                            UPDATE payments

                            SET
                                payment_status = 'completed',
                                merchant_request_id = ?,
                                checkout_request_id = ?,
                                mpesa_receipt_number = ?,
                                transaction_reference = ?

                            WHERE checkout_request_id = ?
                            AND payment_status = 'pending'
                        `;


                        db.query(
                            updatePaymentSql,
                            [
                                merchantRequestId ||
                                    null,

                                checkoutRequestId,

                                mpesaReceiptNumber,

                                mpesaReceiptNumber ||
                                    checkoutRequestId,

                                checkoutRequestId
                            ],
                            (err, paymentResult) => {

                                if (err) {

                                    console.error(
                                        "Error completing M-Pesa payment:",
                                        err
                                    );

                                    return db.rollback(
                                        () => {

                                            res.status(200).json({
                                                ResultCode: 0,
                                                ResultDesc:
                                                    "Callback received."
                                            });

                                        }
                                    );

                                }


                                // Prevent duplicate callback
                                // processing.

                                if (
                                    paymentResult.affectedRows ===
                                    0
                                ) {

                                    console.log(
                                        "M-Pesa payment was already processed:",
                                        checkoutRequestId
                                    );

                                    return db.rollback(
                                        () => {

                                            res.status(200).json({
                                                ResultCode: 0,
                                                ResultDesc:
                                                    "Callback already processed."
                                            });

                                        }
                                    );

                                }


                                // =================================================
                                // Activate Subscription
                                // =================================================

                                const getSubscriptionSql = `
                                    SELECT
                                        subscription_id,
                                        user_id,
                                        plan_id
                                    FROM subscriptions
                                    WHERE subscription_id = ?
                                    AND status = 'pending'
                                    FOR UPDATE
                                `;


                                db.query(
                                    getSubscriptionSql,
                                    [
                                        payment.subscription_id
                                    ],
                                    (
                                        err,
                                        subscriptions
                                    ) => {

                                        if (err) {

                                            console.error(
                                                "Error finding pending subscription:",
                                                err
                                            );

                                            return db.rollback(
                                                () => {

                                                    res.status(200).json({
                                                        ResultCode: 0,
                                                        ResultDesc:
                                                            "Callback received."
                                                    });

                                                }
                                            );

                                        }


                                        if (
                                            subscriptions.length ===
                                            0
                                        ) {

                                            console.error(
                                                "Pending subscription not found:",
                                                payment.subscription_id
                                            );

                                            return db.rollback(
                                                () => {

                                                    res.status(200).json({
                                                        ResultCode: 0,
                                                        ResultDesc:
                                                            "Callback received."
                                                    });

                                                }
                                            );

                                        }


                                        const subscription =
                                            subscriptions[0];


                                        // =================================================
                                        // Activate Pending Subscription
                                        // =================================================

                                        const activateSql = `
                                            UPDATE subscriptions

                                            SET
                                                status = 'active',
                                                start_date = CURDATE(),
                                                end_date = DATE_ADD(
                                                    CURDATE(),
                                                    INTERVAL ? DAY
                                                )

                                            WHERE subscription_id = ?

                                            AND status = 'pending'
                                        `;


                                        db.query(
                                            activateSql,
                                            [
                                                payment.duration_days,

                                                payment.subscription_id
                                            ],
                                            (
                                                err,
                                                activationResult
                                            ) => {

                                                if (err) {

                                                    console.error(
                                                        "Error activating subscription:",
                                                        err
                                                    );

                                                    return db.rollback(
                                                        () => {

                                                            res.status(200).json({
                                                                ResultCode: 0,
                                                                ResultDesc:
                                                                    "Callback received."
                                                            });

                                                        }
                                                    );

                                                }


                                                if (
                                                    activationResult.affectedRows ===
                                                    0
                                                ) {

                                                    console.error(
                                                        "Subscription could not be activated:",
                                                        payment.subscription_id
                                                    );

                                                    return db.rollback(
                                                        () => {

                                                            res.status(200).json({
                                                                ResultCode: 0,
                                                                ResultDesc:
                                                                    "Callback received."
                                                            });

                                                        }
                                                    );

                                                }


                                                // =================================================
                                                // Cancel Previous Active Subscription(s)
                                                // =================================================

                                                const cancelPreviousSql = `
                                                    UPDATE subscriptions

                                                    SET
                                                        status = 'cancelled'

                                                    WHERE user_id = ?

                                                    AND subscription_id <> ?

                                                    AND status = 'active'
                                                `;


                                                db.query(
                                                    cancelPreviousSql,
                                                    [
                                                        subscription.user_id,

                                                        payment.subscription_id
                                                    ],
                                                    (
                                                        err
                                                    ) => {

                                                        if (err) {

                                                            console.error(
                                                                "Error cancelling previous subscription:",
                                                                err
                                                            );

                                                            return db.rollback(
                                                                () => {

                                                                    res.status(200).json({
                                                                        ResultCode: 0,
                                                                        ResultDesc:
                                                                            "Callback received."
                                                                    });

                                                                }
                                                            );

                                                        }


                                                        // =================================================
                                                        // Commit Everything
                                                        // =================================================

                                                        db.commit(
                                                            (
                                                                err
                                                            ) => {

                                                                if (err) {

                                                                    console.error(
                                                                        "Error committing M-Pesa transaction:",
                                                                        err
                                                                    );

                                                                    return db.rollback(
                                                                        () => {

                                                                            res.status(200).json({
                                                                                ResultCode: 0,
                                                                                ResultDesc:
                                                                                    "Callback received."
                                                                            });

                                                                        }
                                                                    );

                                                                }


                                                                console.log(
                                                                    "M-Pesa payment completed successfully."
                                                                );

                                                                console.log(
                                                                    "Payment ID:",
                                                                    payment.payment_id
                                                                );

                                                                console.log(
                                                                    "M-Pesa Receipt:",
                                                                    mpesaReceiptNumber
                                                                );

                                                                console.log(
                                                                    "Amount:",
                                                                    callbackAmount
                                                                );

                                                                console.log(
                                                                    "Phone:",
                                                                    callbackPhoneNumber
                                                                );

                                                                console.log(
                                                                    "Transaction Date:",
                                                                    transactionDate
                                                                );

                                                                console.log(
                                                                    "Subscription activated:",
                                                                    payment.subscription_id
                                                                );

                                                                console.log(
                                                                    "Previous active subscription(s) cancelled for user:",
                                                                    subscription.user_id
                                                                );


                                                                return res.status(200).json({
                                                                    ResultCode: 0,
                                                                    ResultDesc:
                                                                        "Callback received successfully."
                                                                });

                                                            }
                                                        );

                                                    }
                                                );

                                            }
                                        );

                                    }
                                );

                            }
                        );

                    }
                );


                return;

            }


            // =================================================
            // Failed / Cancelled Payment
            // =================================================

            const updateFailedPaymentSql = `
                UPDATE payments

                SET
                    payment_status = 'failed',
                    merchant_request_id = ?,
                    checkout_request_id = ?,
                    transaction_reference = ?

                WHERE checkout_request_id = ?
                AND payment_status = 'pending'
            `;


            db.query(
                updateFailedPaymentSql,
                [
                    merchantRequestId ||
                        null,

                    checkoutRequestId,

                    resultDesc ||
                        "M-Pesa payment failed.",

                    checkoutRequestId
                ],
                (err) => {

                    if (err) {

                        console.error(
                            "Error marking M-Pesa payment as failed:",
                            err
                        );

                    } else {

                        console.log(
                            "M-Pesa payment failed:",
                            resultDesc
                        );

                    }


                    return res.status(200).json({
                        ResultCode: 0,
                        ResultDesc:
                            "Callback received successfully."
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

            pay.merchant_request_id,

            pay.checkout_request_id,

            pay.mpesa_receipt_number,

            pay.payment_status,

            pay.payment_date

        FROM payments pay

        JOIN subscriptions s
            ON pay.subscription_id =
               s.subscription_id

        JOIN subscription_plans sp
            ON s.plan_id =
               sp.plan_id

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
                    error:
                        err
                });

            }


            res.status(200).json(
                results
            );

        }
    );

};


// =====================================================
// Update Payment Status
// Admin Only
// =====================================================

exports.updatePaymentStatus = (req, res) => {

    if (req.user.role !== "admin") {

        return res.status(403).json({
            message:
                "Access denied. Admins only."
        });

    }


    const {
        paymentId
    } = req.params;


    const {
        payment_status
    } = req.body;


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


    if (
        !allowedStatuses.includes(
            payment_status
        )
    ) {

        return res.status(400).json({
            message:
                "Invalid payment status."
        });

    }


    const findPaymentSql = `
        SELECT

            pay.payment_id,
            pay.subscription_id,

            s.user_id,
            s.status AS subscription_status,

            sp.plan_name,
            sp.duration_days,

            pay.amount,
            pay.payment_method,
            pay.transaction_reference,
            pay.payment_status

        FROM payments pay

        JOIN subscriptions s
            ON pay.subscription_id =
               s.subscription_id

        JOIN subscription_plans sp
            ON s.plan_id =
               sp.plan_id

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
                    error:
                        err
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
                (err) => {

                    if (err) {

                        console.error(
                            "Error updating payment status:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to update payment status.",
                            error:
                                err
                        });

                    }


                    if (
                        payment_status ===
                        "completed"
                    ) {

                        activateSubscription(
                            payment.subscription_id,
                            payment.duration_days,
                            (err, subscriptionResult) => {

                                if (err) {

                                    return res.status(500).json({
                                        message:
                                            "Payment was updated, but the subscription could not be activated.",
                                        error:
                                            err
                                    });

                                }


                                return res.status(200).json({

                                    message:
                                        "Payment completed and subscription activated successfully.",

                                    payment_id:
                                        Number(
                                            paymentId
                                        ),

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
                                        payment_status,

                                    subscription_activated:
                                        subscriptionResult
                                            .affectedRows > 0

                                });

                            }
                        );

                        return;

                    }


                    res.status(200).json({

                        message:
                            "Payment status updated successfully.",

                        payment_id:
                            Number(
                                paymentId
                            ),

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