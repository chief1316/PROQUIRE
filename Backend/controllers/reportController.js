const db = require("../config/db");


// =====================================================
// Create Report
// User reports another user
// =====================================================

exports.createReport = (req, res) => {

    const reporter_id = req.user.user_id;

    const {
        reported_user_id,
        reason
    } = req.body;


    // Check required fields
    if (!reported_user_id) {
        return res.status(400).json({
            message: "reported_user_id is required."
        });
    }

    if (!reason) {
        return res.status(400).json({
            message: "reason is required."
        });
    }


    // Prevent users from reporting themselves
    if (Number(reported_user_id) === Number(reporter_id)) {
        return res.status(400).json({
            message: "You cannot report yourself."
        });
    }


    // Check whether the reported user exists
    const checkUserSql = `
        SELECT
            user_id,
            full_name,
            email
        FROM users
        WHERE user_id = ?
    `;

    db.query(
        checkUserSql,
        [reported_user_id],
        (err, users) => {

            if (err) {
                console.error(
                    "Error checking reported user:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to check reported user.",
                    error: err
                });
            }


            if (users.length === 0) {
                return res.status(404).json({
                    message: "Reported user not found."
                });
            }


            // Create the report
            const insertReportSql = `
                INSERT INTO reports
                (
                    reporter_id,
                    reported_user_id,
                    reason,
                    report_status
                )
                VALUES (?, ?, ?, 'pending')
            `;

            db.query(
                insertReportSql,
                [
                    reporter_id,
                    reported_user_id,
                    reason
                ],
                (err, result) => {

                    if (err) {
                        console.error(
                            "Error creating report:",
                            err
                        );

                        return res.status(500).json({
                            message: "Failed to create report.",
                            error: err
                        });
                    }


                    res.status(201).json({
                        message: "Report created successfully.",
                        report: {
                            report_id: result.insertId,
                            reporter_id: reporter_id,
                            reported_user_id:
                                Number(reported_user_id),
                            reported_user_name:
                                users[0].full_name,
                            reason: reason,
                            report_status: "pending"
                        }
                    });

                }
            );

        }
    );
};


// =====================================================
// Get My Reports
// User views reports they have submitted
// =====================================================

exports.getMyReports = (req, res) => {

    const reporter_id = req.user.user_id;


    const sql = `
        SELECT
            r.report_id,
            r.reporter_id,
            r.reported_user_id,
            u.full_name AS reported_user_name,
            u.email AS reported_user_email,
            r.reason,
            r.report_status,
            r.reported_at
        FROM reports r
        JOIN users u
            ON r.reported_user_id = u.user_id
        WHERE r.reporter_id = ?
        ORDER BY r.report_id DESC
    `;


    db.query(
        sql,
        [reporter_id],
        (err, results) => {

            if (err) {
                console.error(
                    "Error fetching my reports:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to fetch your reports.",
                    error: err
                });
            }


            res.status(200).json(results);

        }
    );
};


// =====================================================
// Get All Reports
// Admin Only
// =====================================================

exports.getAllReports = (req, res) => {


    const sql = `
        SELECT
            r.report_id,

            r.reporter_id,
            reporter.full_name AS reporter_name,
            reporter.email AS reporter_email,

            r.reported_user_id,
            reported.full_name AS reported_user_name,
            reported.email AS reported_user_email,

            r.reason,
            r.report_status,
            r.reported_at

        FROM reports r

        JOIN users reporter
            ON r.reporter_id = reporter.user_id

        JOIN users reported
            ON r.reported_user_id = reported.user_id

        ORDER BY r.report_id DESC
    `;


    db.query(
        sql,
        (err, results) => {

            if (err) {
                console.error(
                    "Error fetching all reports:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to fetch reports.",
                    error: err
                });
            }


            res.status(200).json(results);

        }
    );
};


// =====================================================
// Update Report Status
// Admin Only
// =====================================================

exports.updateReportStatus = (req, res) => {

    const {
        reportId
    } = req.params;

    const {
        report_status
    } = req.body;


    const allowedStatuses = [
        "pending",
        "resolved",
        "dismissed"
    ];


    // Check status
    if (!report_status) {
        return res.status(400).json({
            message: "report_status is required."
        });
    }


    if (!allowedStatuses.includes(report_status)) {
        return res.status(400).json({
            message: "Invalid report status."
        });
    }


    // Check whether report exists
    const findReportSql = `
        SELECT
            report_id,
            reporter_id,
            reported_user_id,
            reason,
            report_status,
            reported_at
        FROM reports
        WHERE report_id = ?
    `;


    db.query(
        findReportSql,
        [reportId],
        (err, reports) => {

            if (err) {
                console.error(
                    "Error finding report:",
                    err
                );

                return res.status(500).json({
                    message: "Failed to find report.",
                    error: err
                });
            }


            if (reports.length === 0) {
                return res.status(404).json({
                    message: "Report not found."
                });
            }


            const report = reports[0];


            // Update status
            const updateSql = `
                UPDATE reports
                SET report_status = ?
                WHERE report_id = ?
            `;


            db.query(
                updateSql,
                [
                    report_status,
                    reportId
                ],
                (err, result) => {

                    if (err) {
                        console.error(
                            "Error updating report status:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to update report status.",
                            error: err
                        });
                    }


                    res.status(200).json({
                        message:
                            "Report status updated successfully.",

                        report_id:
                            Number(reportId),

                        reporter_id:
                            report.reporter_id,

                        reported_user_id:
                            report.reported_user_id,

                        reason:
                            report.reason,

                        previous_status:
                            report.report_status,

                        report_status:
                            report_status,

                        reported_at:
                            report.reported_at
                    });

                }
            );

        }
    );
};