const db = require("../config/db");


// =====================================================
// Get All Active Subscription Plans
// =====================================================

exports.getPlans = (req, res) => {

    const sql = `
        SELECT
            plan_id,
            plan_name,
            description,
            price,
            duration_days,
            features,
            status,
            created_at
        FROM subscription_plans
        WHERE status = 'active'
        ORDER BY price ASC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Error fetching subscription plans:",
                err
            );

            return res.status(500).json({
                message: "Failed to fetch subscription plans.",
                error: err
            });
        }

        res.status(200).json(results);

    });

};


// =====================================================
// Subscribe User to a Plan
// =====================================================

exports.subscribe = (req, res) => {

    const user_id = req.user.user_id;
    const { plan_id } = req.body;


    // Check that plan_id was provided

    if (!plan_id) {

        return res.status(400).json({
            message: "plan_id is required."
        });

    }


    // Find the selected plan

    const planSql = `
        SELECT
            plan_id,
            plan_name,
            price,
            duration_days
        FROM subscription_plans
        WHERE plan_id = ?
        AND status = 'active'
    `;

    db.query(
        planSql,
        [plan_id],
        (err, plans) => {

            if (err) {

                console.error(
                    "Error checking subscription plan:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to check subscription plan.",
                    error: err
                });

            }


            // Plan does not exist

            if (plans.length === 0) {

                return res.status(404).json({
                    message: "Subscription plan not found or inactive."
                });

            }


            const plan = plans[0];


            // Check whether the user already has
            // an active or pending subscription

            const existingSql = `
                SELECT
                    subscription_id,
                    plan_id,
                    start_date,
                    end_date,
                    status
                FROM subscriptions
                WHERE user_id = ?
                AND status IN ('active', 'pending')
                ORDER BY subscription_id DESC
                LIMIT 1
            `;

            db.query(
                existingSql,
                [user_id],
                (err, existingSubscriptions) => {

                    if (err) {

                        console.error(
                            "Error checking existing subscription:",
                            err
                        );

                        return res.status(500).json({
                            message: "Failed to check existing subscription.",
                            error: err
                        });

                    }


                    // Prevent duplicate active subscription

                    if (existingSubscriptions.length > 0) {

                        return res.status(409).json({
                            message: "You already have an active or pending subscription.",
                            subscription: existingSubscriptions[0]
                        });

                    }


                    // Calculate subscription dates

                    const startDate = new Date();

                    const endDate = new Date(startDate);

                    endDate.setDate(
                        endDate.getDate() + plan.duration_days
                    );


                    // Format dates for MySQL

                    const formatDate = (date) => {

                        return date.toISOString().split("T")[0];

                    };


                    const formattedStartDate =
                        formatDate(startDate);

                    const formattedEndDate =
                        formatDate(endDate);


                    // Insert subscription

                    const insertSql = `
                        INSERT INTO subscriptions
                        (
                            user_id,
                            plan_id,
                            start_date,
                            end_date,
                            status
                        )
                        VALUES (?, ?, ?, ?, 'active')
                    `;

                    db.query(
                        insertSql,
                        [
                            user_id,
                            plan.plan_id,
                            formattedStartDate,
                            formattedEndDate
                        ],
                        (err, result) => {

                            if (err) {

                                console.error(
                                    "Error creating subscription:",
                                    err
                                );

                                return res.status(500).json({
                                    message: "Failed to create subscription.",
                                    error: err
                                });

                            }


                            res.status(201).json({

                                message:
                                    "Subscription created successfully.",

                                subscription: {
                                    subscription_id:
                                        result.insertId,

                                    user_id:
                                        user_id,

                                    plan_id:
                                        plan.plan_id,

                                    plan_name:
                                        plan.plan_name,

                                    price:
                                        plan.price,

                                    start_date:
                                        formattedStartDate,

                                    end_date:
                                        formattedEndDate,

                                    status:
                                        "active"
                                }

                            });

                        }
                    );

                }
            );

        }
    );

};


// =====================================================
// Get Current User Subscription
// =====================================================

exports.getMySubscription = (req, res) => {

    const user_id = req.user.user_id;


    const sql = `
        SELECT
            s.subscription_id,
            s.user_id,
            s.plan_id,
            p.plan_name,
            p.description,
            p.price,
            p.duration_days,
            p.features,
            s.start_date,
            s.end_date,
            s.status,
            s.created_at
        FROM subscriptions s
        JOIN subscription_plans p
            ON s.plan_id = p.plan_id
        WHERE s.user_id = ?
        ORDER BY s.subscription_id DESC
        LIMIT 1
    `;

    db.query(
        sql,
        [user_id],
        (err, results) => {

            if (err) {

                console.error(
                    "Error fetching user subscription:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to fetch subscription.",
                    error: err
                });

            }


            if (results.length === 0) {

                return res.status(404).json({
                    message: "You do not have a subscription."
                });

            }


            res.status(200).json(
                results[0]
            );

        }
    );

};


// =====================================================
// Cancel Current User Subscription
// =====================================================

exports.cancelSubscription = (req, res) => {

    const user_id = req.user.user_id;


    const sql = `
        UPDATE subscriptions
        SET status = 'cancelled'
        WHERE user_id = ?
        AND status = 'active'
        ORDER BY subscription_id DESC
        LIMIT 1
    `;


    db.query(
        sql,
        [user_id],
        (err, result) => {

            if (err) {

                console.error(
                    "Error cancelling subscription:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to cancel subscription.",
                    error: err
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message: "No active subscription found."
                });

            }


            res.status(200).json({
                message:
                    "Subscription cancelled successfully."
            });

        }
    );

};