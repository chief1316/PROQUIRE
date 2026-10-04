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
// Creates a PENDING subscription
// =====================================================

exports.subscribe = (req, res) => {
    const user_id = req.user.user_id;
    const { plan_id } = req.body;

    if (!plan_id) {
        return res.status(400).json({
            message: "plan_id is required."
        });
    }

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
                    message:
                        "Failed to check subscription plan.",
                    error: err
                });
            }

            if (plans.length === 0) {
                return res.status(404).json({
                    message:
                        "Subscription plan not found or inactive."
                });
            }

            const plan = plans[0];

            const existingSql = `
                SELECT
                    s.subscription_id,
                    s.plan_id,
                    s.start_date,
                    s.end_date,
                    s.status,
                    p.plan_name,
                    p.price
                FROM subscriptions s
                JOIN subscription_plans p
                    ON s.plan_id = p.plan_id
                WHERE s.user_id = ?
                AND s.status IN ('active', 'pending')
                ORDER BY s.subscription_id DESC
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
                            message:
                                "Failed to check existing subscription.",
                            error: err
                        });
                    }

                    const pendingSubscription =
                        existingSubscriptions.find(
                            (subscription) =>
                                subscription.status ===
                                "pending"
                        );

                    if (pendingSubscription) {
                        return res.status(409).json({
                            message:
                                "You already have a pending subscription awaiting payment.",
                            subscription:
                                pendingSubscription
                        });
                    }

                    const activeSubscription =
                        existingSubscriptions.find(
                            (subscription) =>
                                subscription.status ===
                                "active"
                        );

                    if (activeSubscription) {
                        const currentPrice = Number(
                            activeSubscription.price
                        );

                        const newPrice = Number(
                            plan.price
                        );

                        if (
                            newPrice ===
                            currentPrice
                        ) {
                            return res.status(409).json({
                                message:
                                    "You are already subscribed to this plan.",
                                subscription:
                                    activeSubscription
                            });
                        }

                        if (
                            newPrice <
                            currentPrice
                        ) {
                            return res.status(400).json({
                                message:
                                    "You cannot downgrade your subscription from this page."
                            });
                        }
                    }

                    const startDate = new Date();

                    const endDate = new Date(
                        startDate
                    );

                    endDate.setDate(
                        endDate.getDate() +
                            plan.duration_days
                    );

                    const formatDate = (date) => {
                        return date
                            .toISOString()
                            .split("T")[0];
                    };

                    const formattedStartDate =
                        formatDate(startDate);

                    const formattedEndDate =
                        formatDate(endDate);

                    const insertSql = `
                        INSERT INTO subscriptions
                        (
                            user_id,
                            plan_id,
                            start_date,
                            end_date,
                            status
                        )
                        VALUES (?, ?, ?, ?, 'pending')
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
                                    message:
                                        "Failed to create subscription.",
                                    error: err
                                });
                            }

                            res.status(201).json({
                                message:
                                    "Subscription created successfully and is pending payment.",
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
                                        "pending",
                                    previous_subscription_id:
                                        activeSubscription
                                            ? activeSubscription.subscription_id
                                            : null
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