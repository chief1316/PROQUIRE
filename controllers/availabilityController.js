const db = require("../config/db");


// =====================================================
// Create Availability
// Technician creates their availability
// =====================================================

exports.createAvailability = (req, res) => {

    const technician_id = req.user.user_id;

    const {
        available_day,
        available_from,
        available_to
    } = req.body;


    // Check required fields
    if (!available_day) {
        return res.status(400).json({
            message: "available_day is required."
        });
    }

    if (!available_from) {
        return res.status(400).json({
            message: "available_from is required."
        });
    }

    if (!available_to) {
        return res.status(400).json({
            message: "available_to is required."
        });
    }


    // Validate day
    const allowedDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    if (!allowedDays.includes(available_day)) {
        return res.status(400).json({
            message:
                "Invalid available_day. Use Monday to Sunday."
        });
    }


    // Make sure ending time is after starting time
    if (available_from >= available_to) {
        return res.status(400).json({
            message:
                "available_to must be later than available_from."
        });
    }


    // Check whether technician exists
    const checkUserSql = `
        SELECT
            user_id,
            full_name,
            role
        FROM users
        WHERE user_id = ?
    `;

    db.query(
        checkUserSql,
        [technician_id],
        (err, users) => {

            if (err) {
                console.error(
                    "Error checking technician:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to check technician.",
                    error: err
                });
            }


            if (users.length === 0) {
                return res.status(404).json({
                    message:
                        "Technician account not found."
                });
            }


            // Check for overlapping availability
            const overlapSql = `
                SELECT
                    availability_id
                FROM availability
                WHERE technician_id = ?
                AND available_day = ?
                AND available_from < ?
                AND available_to > ?
            `;

            db.query(
                overlapSql,
                [
                    technician_id,
                    available_day,
                    available_to,
                    available_from
                ],
                (err, existing) => {

                    if (err) {
                        console.error(
                            "Error checking availability:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to check existing availability.",
                            error: err
                        });
                    }


                    if (existing.length > 0) {
                        return res.status(409).json({
                            message:
                                "This availability period overlaps with an existing schedule."
                        });
                    }


                    // Insert availability
                    const insertSql = `
                        INSERT INTO availability
                        (
                            technician_id,
                            available_day,
                            available_from,
                            available_to
                        )
                        VALUES (?, ?, ?, ?)
                    `;

                    db.query(
                        insertSql,
                        [
                            technician_id,
                            available_day,
                            available_from,
                            available_to
                        ],
                        (err, result) => {

                            if (err) {
                                console.error(
                                    "Error creating availability:",
                                    err
                                );

                                return res.status(500).json({
                                    message:
                                        "Failed to create availability.",
                                    error: err
                                });
                            }


                            res.status(201).json({
                                message:
                                    "Availability created successfully.",

                                availability: {
                                    availability_id:
                                        result.insertId,

                                    technician_id:
                                        technician_id,

                                    technician_name:
                                        users[0].full_name,

                                    available_day:
                                        available_day,

                                    available_from:
                                        available_from,

                                    available_to:
                                        available_to
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
// Get My Availability
// Technician views their own availability
// =====================================================

exports.getMyAvailability = (req, res) => {

    const technician_id = req.user.user_id;


    const sql = `
        SELECT
            availability_id,
            technician_id,
            available_day,
            available_from,
            available_to
        FROM availability
        WHERE technician_id = ?
        ORDER BY
            FIELD(
                available_day,
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
            ),
            available_from
    `;


    db.query(
        sql,
        [technician_id],
        (err, results) => {

            if (err) {
                console.error(
                    "Error fetching availability:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to fetch your availability.",
                    error: err
                });
            }


            res.status(200).json(results);

        }
    );
};


// =====================================================
// Get Technician Availability
// Public
// =====================================================

exports.getTechnicianAvailability = (req, res) => {

    const {
        technicianId
    } = req.params;


    const sql = `
        SELECT
            a.availability_id,
            a.technician_id,
            u.full_name AS technician_name,
            a.available_day,
            a.available_from,
            a.available_to
        FROM availability a
        JOIN users u
            ON a.technician_id = u.user_id
        WHERE a.technician_id = ?
        ORDER BY
            FIELD(
                a.available_day,
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday'
            ),
            a.available_from
    `;


    db.query(
        sql,
        [technicianId],
        (err, results) => {

            if (err) {
                console.error(
                    "Error fetching technician availability:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to fetch technician availability.",
                    error: err
                });
            }


            if (results.length === 0) {
                return res.status(404).json({
                    message:
                        "No availability found for this technician."
                });
            }


            res.status(200).json(results);

        }
    );
};


// =====================================================
// Update Availability
// Technician updates their own availability
// =====================================================

exports.updateAvailability = (req, res) => {

    const technician_id = req.user.user_id;

    const {
        availabilityId
    } = req.params;

    const {
        available_day,
        available_from,
        available_to
    } = req.body;


    // Check required fields
    if (!available_day) {
        return res.status(400).json({
            message: "available_day is required."
        });
    }

    if (!available_from) {
        return res.status(400).json({
            message: "available_from is required."
        });
    }

    if (!available_to) {
        return res.status(400).json({
            message: "available_to is required."
        });
    }


    // Validate day
    const allowedDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    if (!allowedDays.includes(available_day)) {
        return res.status(400).json({
            message:
                "Invalid available_day. Use Monday to Sunday."
        });
    }


    // Validate time
    if (available_from >= available_to) {
        return res.status(400).json({
            message:
                "available_to must be later than available_from."
        });
    }


    // Make sure the availability belongs to this technician
    const findSql = `
        SELECT
            availability_id,
            technician_id,
            available_day,
            available_from,
            available_to
        FROM availability
        WHERE availability_id = ?
        AND technician_id = ?
    `;


    db.query(
        findSql,
        [
            availabilityId,
            technician_id
        ],
        (err, results) => {

            if (err) {
                console.error(
                    "Error finding availability:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to find availability.",
                    error: err
                });
            }


            if (results.length === 0) {
                return res.status(404).json({
                    message:
                        "Availability not found or does not belong to you."
                });
            }


            // Check for overlapping schedules
            const overlapSql = `
                SELECT
                    availability_id
                FROM availability
                WHERE technician_id = ?
                AND available_day = ?
                AND available_from < ?
                AND available_to > ?
                AND availability_id != ?
            `;


            db.query(
                overlapSql,
                [
                    technician_id,
                    available_day,
                    available_to,
                    available_from,
                    availabilityId
                ],
                (err, existing) => {

                    if (err) {
                        console.error(
                            "Error checking overlapping availability:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to check overlapping availability.",
                            error: err
                        });
                    }


                    if (existing.length > 0) {
                        return res.status(409).json({
                            message:
                                "This availability period overlaps with an existing schedule."
                        });
                    }


                    const updateSql = `
                        UPDATE availability
                        SET
                            available_day = ?,
                            available_from = ?,
                            available_to = ?
                        WHERE availability_id = ?
                        AND technician_id = ?
                    `;


                    db.query(
                        updateSql,
                        [
                            available_day,
                            available_from,
                            available_to,
                            availabilityId,
                            technician_id
                        ],
                        (err, result) => {

                            if (err) {
                                console.error(
                                    "Error updating availability:",
                                    err
                                );

                                return res.status(500).json({
                                    message:
                                        "Failed to update availability.",
                                    error: err
                                });
                            }


                            res.status(200).json({
                                message:
                                    "Availability updated successfully.",

                                availability: {
                                    availability_id:
                                        Number(availabilityId),

                                    technician_id:
                                        technician_id,

                                    available_day:
                                        available_day,

                                    available_from:
                                        available_from,

                                    available_to:
                                        available_to
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
// Delete Availability
// Technician deletes their own availability
// =====================================================

exports.deleteAvailability = (req, res) => {

    const technician_id = req.user.user_id;

    const {
        availabilityId
    } = req.params;


    const findSql = `
        SELECT
            availability_id,
            technician_id,
            available_day,
            available_from,
            available_to
        FROM availability
        WHERE availability_id = ?
        AND technician_id = ?
    `;


    db.query(
        findSql,
        [
            availabilityId,
            technician_id
        ],
        (err, results) => {

            if (err) {
                console.error(
                    "Error finding availability:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to find availability.",
                    error: err
                });
            }


            if (results.length === 0) {
                return res.status(404).json({
                    message:
                        "Availability not found or does not belong to you."
                });
            }


            const deleteSql = `
                DELETE FROM availability
                WHERE availability_id = ?
                AND technician_id = ?
            `;


            db.query(
                deleteSql,
                [
                    availabilityId,
                    technician_id
                ],
                (err, result) => {

                    if (err) {
                        console.error(
                            "Error deleting availability:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to delete availability.",
                            error: err
                        });
                    }


                    res.status(200).json({
                        message:
                            "Availability deleted successfully.",

                        availability_id:
                            Number(availabilityId)
                    });

                }
            );

        }
    );
};