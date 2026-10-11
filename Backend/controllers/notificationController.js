const db = require("../config/db");

/*
 * ==========================================
 * GET TECHNICIAN ID FROM LOGGED-IN USER
 * ==========================================
 */

const getTechnicianId = (userId, callback) => {
    const sql = `
        SELECT technician_id
        FROM technician_profiles
        WHERE user_id = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [userId],
        (err, results) => {
            if (err) {
                return callback(err, null);
            }

            if (results.length === 0) {
                return callback(null, null);
            }

            return callback(
                null,
                results[0].technician_id
            );
        }
    );
};


/*
 * ==========================================
 * GET AGENCY ID FROM LOGGED-IN USER
 * ==========================================
 */

const getAgencyId = (userId, callback) => {
    const sql = `
        SELECT agency_id
        FROM agency_profiles
        WHERE user_id = ?
        LIMIT 1
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            return callback(err, null);
        }

        if (results.length === 0) {
            return callback(null, null);
        }

        return callback(null, results[0].agency_id);
    });
};



/*
 * ==========================================
 * GET TECHNICIAN NOTIFICATIONS
 * ==========================================
 */

exports.getTechnicianNotifications = (req, res) => {

    const userId = req.user.user_id;

    console.log(
        "NOTIFICATION REQUEST USER:",
        req.user
    );

    getTechnicianId(
        userId,
        (technicianErr, technicianId) => {

            if (technicianErr) {
                console.error(
                    "Error finding technician profile:",
                    technicianErr
                );

                return res.status(500).json({
                    message:
                        "Unable to identify technician."
                });
            }

            if (!technicianId) {
                return res.status(404).json({
                    message:
                        "Technician profile not found."
                });
            }

            console.log(
                "NOTIFICATION TECHNICIAN ID:",
                technicianId
            );

            const sql = `
                SELECT
                    notification_id,
                    technician_id,
                    document_id,
                    notification_type,
                    title,
                    message,
                    is_read,
                    created_at
                FROM notifications
                WHERE technician_id = ?
                ORDER BY created_at DESC
            `;

            db.query(
                sql,
                [technicianId],
                (err, results) => {

                    if (err) {
                        console.error(
                            "Error fetching technician notifications:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Unable to fetch notifications."
                        });
                    }

                    console.log(
                        "NOTIFICATIONS FOUND:",
                        results.length
                    );

                    return res.status(200).json(
                        results
                    );
                }
            );
        }
    );
};


/*
 * ==========================================
 * GET AGENCY NOTIFICATIONS
 * ==========================================
 */

exports.getAgencyNotifications = (req, res) => {
    const userId = req.user.user_id;

    getAgencyId(userId, (agencyErr, agencyId) => {
        if (agencyErr) {
            console.error(
                "Error finding agency profile:",
                agencyErr
            );

            return res.status(500).json({
                message: "Unable to identify agency."
            });
        }

        if (!agencyId) {
            return res.status(404).json({
                message: "Agency profile not found."
            });
        }

        const sql = `
            SELECT
                notification_id,
                agency_id,
                document_id,
                notification_type,
                title,
                message,
                is_read,
                created_at
            FROM notifications
            WHERE agency_id = ?
            ORDER BY created_at DESC
        `;

        db.query(sql, [agencyId], (err, results) => {
            if (err) {
                console.error(
                    "Error fetching agency notifications:",
                    err
                );

                return res.status(500).json({
                    message: "Unable to fetch notifications."
                });
            }

            return res.status(200).json(results);
        });
    });
};



/*
 * ==========================================
 * MARK ONE NOTIFICATION AS READ
 * ==========================================
 */

exports.markNotificationAsRead = (req, res) => {

    const { notificationId } = req.params;
    const userId = req.user.user_id;

    getTechnicianId(
        userId,
        (technicianErr, technicianId) => {

            if (technicianErr) {
                console.error(
                    "Error finding technician profile:",
                    technicianErr
                );

                return res.status(500).json({
                    message:
                        "Unable to identify technician."
                });
            }

            if (!technicianId) {
                return res.status(404).json({
                    message:
                        "Technician profile not found."
                });
            }

            const sql = `
                UPDATE notifications
                SET is_read = 1
                WHERE notification_id = ?
                AND technician_id = ?
            `;

            db.query(
                sql,
                [
                    notificationId,
                    technicianId
                ],
                (err, result) => {

                    if (err) {
                        console.error(
                            "Error marking notification as read:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Unable to mark notification as read."
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            message:
                                "Notification not found."
                        });
                    }

                    return res.status(200).json({
                        message:
                            "Notification marked as read."
                    });
                }
            );
        }
    );
};


/*
 * ==========================================
 * MARK ALL TECHNICIAN NOTIFICATIONS AS READ
 * ==========================================
 */

exports.markAllNotificationsAsRead = (req, res) => {

    const userId = req.user.user_id;

    getTechnicianId(
        userId,
        (technicianErr, technicianId) => {

            if (technicianErr) {
                console.error(
                    "Error finding technician profile:",
                    technicianErr
                );

                return res.status(500).json({
                    message:
                        "Unable to identify technician."
                });
            }

            if (!technicianId) {
                return res.status(404).json({
                    message:
                        "Technician profile not found."
                });
            }

            const sql = `
                UPDATE notifications
                SET is_read = 1
                WHERE technician_id = ?
                AND is_read = 0
            `;

            db.query(
                sql,
                [technicianId],
                (err) => {

                    if (err) {
                        console.error(
                            "Error marking all notifications as read:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Unable to mark all notifications as read."
                        });
                    }

                    return res.status(200).json({
                        message:
                            "All notifications marked as read."
                    });
                }
            );
        }
    );
};


/*
 * ==========================================
 * MARK ONE AGENCY NOTIFICATION AS READ
 * ==========================================
 */

exports.markAgencyNotificationAsRead = (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user.user_id;

    getAgencyId(userId, (err, agencyId) => {
        if (err) {
            return res.status(500).json({
                message: "Unable to identify agency."
            });
        }

        if (!agencyId) {
            return res.status(404).json({
                message: "Agency profile not found."
            });
        }

        const sql = `
            UPDATE notifications
            SET is_read = 1
            WHERE notification_id = ?
              AND agency_id = ?
        `;

        db.query(sql, [notificationId, agencyId], (err, result) => {
            if (err) {
                console.error("Error marking agency notification as read:", err);

                return res.status(500).json({
                    message: "Unable to mark notification as read."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Notification not found."
                });
            }

            return res.status(200).json({
                message: "Notification marked as read."
            });
        });
    });
};


/*
 * ==========================================
 * MARK ALL AGENCY NOTIFICATIONS AS READ
 * ==========================================
 */

exports.markAllAgencyNotificationsAsRead = (req, res) => {
    const userId = req.user.user_id;

    getAgencyId(userId, (err, agencyId) => {
        if (err) {
            return res.status(500).json({
                message: "Unable to identify agency."
            });
        }

        if (!agencyId) {
            return res.status(404).json({
                message: "Agency profile not found."
            });
        }

        const sql = `
            UPDATE notifications
            SET is_read = 1
            WHERE agency_id = ?
              AND is_read = 0
        `;

        db.query(sql, [agencyId], (err) => {
            if (err) {
                console.error("Error marking agency notifications as read:", err);

                return res.status(500).json({
                    message: "Unable to mark all notifications as read."
                });
            }

            return res.status(200).json({
                message: "All agency notifications marked as read."
            });
        });
    });
};
