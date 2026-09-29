
const db = require("../config/db");

const allowedDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

// Resolve the technician profile belonging to the logged-in user.
const getTechnicianProfile = (userId, callback) => {
    const sql = `
        SELECT technician_id
        FROM technician_profiles
        WHERE user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return callback(err);
        }

        if (results.length === 0) {
            return callback(null, null);
        }

        callback(null, results[0].technician_id);
    });
};

// Validate the submitted availability fields.
const validateAvailability = (req, res) => {
    const {
        available_day,
        available_from,
        available_to
    } = req.body;

    if (!allowedDays.includes(available_day)) {
        res.status(400).json({
            message: "Select a valid day from Monday to Sunday."
        });
        return false;
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

    if (
        !timePattern.test(available_from || "") ||
        !timePattern.test(available_to || "")
    ) {
        res.status(400).json({
            message: "Enter valid starting and ending times."
        });
        return false;
    }

    if (available_from >= available_to) {
        res.status(400).json({
            message: "Ending time must be later than starting time."
        });
        return false;
    }

    return true;
};

// Check for overlapping availability periods.
const checkOverlap = (
    technicianId,
    day,
    from,
    to,
    excludeId,
    callback
) => {
    let sql = `
        SELECT availability_id
        FROM availability
        WHERE technician_id = ?
        AND available_day = ?
        AND available_from < ?
        AND available_to > ?
    `;

    const params = [
        technicianId,
        day,
        to,
        from
    ];

    if (excludeId) {
        sql += " AND availability_id != ?";
        params.push(excludeId);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            return callback(err);
        }

        callback(null, results.length > 0);
    });
};

// =====================================================
// Create Availability
// POST /api/availability/create
// =====================================================

exports.createAvailability = (req, res) => {
    if (!validateAvailability(req, res)) {
        return;
    }

    const {
        available_day,
        available_from,
        available_to
    } = req.body;

    getTechnicianProfile(
        req.user.user_id,
        (err, technicianId) => {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to find technician profile."
                });
            }

            if (!technicianId) {
                return res.status(403).json({
                    message: "Only technicians can manage availability."
                });
            }

            checkOverlap(
                technicianId,
                available_day,
                available_from,
                available_to,
                null,
                (overlapErr, hasOverlap) => {
                    if (overlapErr) {
                        console.error(overlapErr);

                        return res.status(500).json({
                            message: "Failed to check existing availability."
                        });
                    }

                    if (hasOverlap) {
                        return res.status(409).json({
                            message:
                                "This time overlaps with an existing schedule."
                        });
                    }

                    const sql = `
                        INSERT INTO availability (
                            technician_id,
                            available_day,
                            available_from,
                            available_to
                        )
                        VALUES (?, ?, ?, ?)
                    `;

                    db.query(
                        sql,
                        [
                            technicianId,
                            available_day,
                            available_from,
                            available_to
                        ],
                        (insertErr, result) => {
                            if (insertErr) {
                                console.error(insertErr);

                                return res.status(500).json({
                                    message: "Failed to create availability."
                                });
                            }

                            return res.status(201).json({
                                message: "Availability created successfully.",
                                availability: {
                                    availability_id: result.insertId,
                                    technician_id: technicianId,
                                    available_day,
                                    available_from,
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
// GET /api/availability/my-availability
// =====================================================

exports.getMyAvailability = (req, res) => {
    getTechnicianProfile(
        req.user.user_id,
        (err, technicianId) => {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to find technician profile."
                });
            }

            if (!technicianId) {
                return res.status(403).json({
                    message: "Only technicians can view availability."
                });
            }

            const sql = `
                SELECT
                    availability_id,
                    technician_id,
                    available_day,
                    TIME_FORMAT(available_from, '%H:%i') AS available_from,
                    TIME_FORMAT(available_to, '%H:%i') AS available_to
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

            db.query(sql, [technicianId], (queryErr, results) => {
                if (queryErr) {
                    console.error(queryErr);

                    return res.status(500).json({
                        message: "Failed to fetch your availability."
                    });
                }

                return res.status(200).json(results);
            });
        }
    );
};

// =====================================================
// Get Technician Availability
// GET /api/availability/technician/:technicianId
// Public
// technicianId is the technician PROFILE ID.
// =====================================================

exports.getTechnicianAvailability = (req, res) => {
    const { technicianId } = req.params;

    const sql = `
        SELECT
            a.availability_id,
            a.technician_id,
            u.full_name AS technician_name,
            a.available_day,
            TIME_FORMAT(a.available_from, '%H:%i') AS available_from,
            TIME_FORMAT(a.available_to, '%H:%i') AS available_to
        FROM availability a
        JOIN technician_profiles tp
            ON a.technician_id = tp.technician_id
        JOIN users u
            ON tp.user_id = u.user_id
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

    db.query(sql, [technicianId], (err, results) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Failed to fetch technician availability."
            });
        }

        return res.status(200).json(results);
    });
};

// =====================================================
// Update Availability
// PATCH /api/availability/:availabilityId
// =====================================================

exports.updateAvailability = (req, res) => {
    if (!validateAvailability(req, res)) {
        return;
    }

    const { availabilityId } = req.params;

    const {
        available_day,
        available_from,
        available_to
    } = req.body;

    getTechnicianProfile(
        req.user.user_id,
        (err, technicianId) => {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to find technician profile."
                });
            }

            if (!technicianId) {
                return res.status(403).json({
                    message: "Only technicians can update availability."
                });
            }

            const findSql = `
                SELECT availability_id
                FROM availability
                WHERE availability_id = ?
                AND technician_id = ?
            `;

            db.query(
                findSql,
                [availabilityId, technicianId],
                (findErr, results) => {
                    if (findErr) {
                        console.error(findErr);

                        return res.status(500).json({
                            message: "Failed to find availability."
                        });
                    }

                    if (results.length === 0) {
                        return res.status(404).json({
                            message:
                                "Availability not found or does not belong to you."
                        });
                    }

                    checkOverlap(
                        technicianId,
                        available_day,
                        available_from,
                        available_to,
                        availabilityId,
                        (overlapErr, hasOverlap) => {
                            if (overlapErr) {
                                console.error(overlapErr);

                                return res.status(500).json({
                                    message:
                                        "Failed to check overlapping availability."
                                });
                            }

                            if (hasOverlap) {
                                return res.status(409).json({
                                    message:
                                        "This time overlaps with an existing schedule."
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
                                    technicianId
                                ],
                                (updateErr, result) => {
                                    if (updateErr) {
                                        console.error(updateErr);

                                        return res.status(500).json({
                                            message:
                                                "Failed to update availability."
                                        });
                                    }

                                    if (result.affectedRows === 0) {
                                        return res.status(404).json({
                                            message:
                                                "Availability was not updated."
                                        });
                                    }

                                    return res.status(200).json({
                                        message:
                                            "Availability updated successfully.",
                                        availability: {
                                            availability_id:
                                                Number(availabilityId),
                                            technician_id: technicianId,
                                            available_day,
                                            available_from,
                                            available_to
                                        }
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
};

// =====================================================
// Delete Availability
// DELETE /api/availability/:availabilityId
// =====================================================

exports.deleteAvailability = (req, res) => {
    const { availabilityId } = req.params;

    getTechnicianProfile(
        req.user.user_id,
        (err, technicianId) => {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Failed to find technician profile."
                });
            }

            if (!technicianId) {
                return res.status(403).json({
                    message: "Only technicians can delete availability."
                });
            }

            const sql = `
                DELETE FROM availability
                WHERE availability_id = ?
                AND technician_id = ?
            `;

            db.query(
                sql,
                [availabilityId, technicianId],
                (deleteErr, result) => {
                    if (deleteErr) {
                        console.error(deleteErr);

                        return res.status(500).json({
                            message: "Failed to delete availability."
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            message:
                                "Availability not found or does not belong to you."
                        });
                    }

                    return res.status(200).json({
                        message: "Availability deleted successfully.",
                        availability_id: Number(availabilityId)
                    });
                }
            );
        }
    );
};