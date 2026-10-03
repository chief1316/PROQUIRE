const db = require("../config/db");

exports.createServiceRequest = (req, res) => {

    const client_id = req.user.user_id;

const {

    technician_id,

    service_description,

    service_address,

    service_date,

    service_time

} = req.body;

    const sql = `
        INSERT INTO service_requests
        (
            client_id,
            technician_id,
            service_description,
            service_address,
            service_date,
            service_time
        )

        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(

        sql,

        [

            client_id,
            technician_id,
            service_description,
            service_address,
            service_date,
            service_time

        ],

        (err, result) => {

            if (err) {

                return res.status(500).json({

                    message: "Error creating service request",
                    error: err

                });

            }

            res.status(201).json({

                message: "Service request created successfully",
                request_id: result.insertId

            });

        }

    );

};

exports.getAllServiceRequests = (req, res) => {

    const sql = `

        SELECT

            sr.request_id,

            client.full_name AS client_name,

            technician.full_name AS technician_name,

            sr.service_description,

            sr.service_address,

            sr.service_date,

            sr.request_status,

            sr.request_date

        FROM service_requests sr

        JOIN users client

            ON sr.client_id = client.user_id

        JOIN technician_profiles tp

            ON sr.technician_id = tp.technician_id

        JOIN users technician

            ON tp.user_id = technician.user_id

        ORDER BY sr.request_id DESC

    `;

    db.query(sql, (err, results) => {

        if (err) {

            return res.status(500).json({

                message: "Error fetching requests",
                error: err

            });

        }

        res.status(200).json(results);

    });

};

exports.getServiceRequestById = (req, res) => {

    const { id } = req.params;

    const sql = `

        SELECT *

        FROM service_requests

        WHERE request_id = ?

    `;

    db.query(sql, [id], (err, results) => {

        if (err) {

            return res.status(500).json({

                message: "Error fetching request",
                error: err

            });

        }

        if (results.length === 0) {

            return res.status(404).json({

                message: "Request not found"

            });

        }

        res.status(200).json(results[0]);

    });

};

exports.getClientRequests = (req, res) => {

    const { clientId } = req.params;

    const sql = `

        SELECT *

        FROM service_requests

        WHERE client_id = ?

        ORDER BY request_id DESC

    `;

    db.query(sql, [clientId], (err, results) => {

        if (err) {

            return res.status(500).json({

                message: "Error fetching requests",
                error: err

            });

        }

        res.status(200).json(results);

    });

};


exports.getTechnicianRequests = (req, res) => {
    const { technicianId } = req.params;

    const sql = `
        SELECT
            sr.request_id,
            sr.client_id,
            client.full_name AS client_name,

            CASE
                WHEN sr.request_status = 'accepted'
                THEN client.phone
                ELSE NULL
            END AS client_phone,

            CASE
                WHEN sr.request_status = 'accepted'
                THEN client.email
                ELSE NULL
            END AS client_email,

            sr.technician_id,
            sr.service_description,
            sr.service_address,
            sr.service_date,
            sr.service_time,
            sr.request_status,
            sr.request_date

        FROM service_requests sr

        JOIN users client
            ON sr.client_id = client.user_id

        WHERE sr.technician_id = ?

        ORDER BY sr.request_id DESC
    `;

    db.query(sql, [technicianId], (err, results) => {
        if (err) {
            console.error("Error fetching technician requests:", err);

            return res.status(500).json({
                message: "Error fetching service requests"
            });
        }

        return res.status(200).json(results);
    });
};

// Accept or reject a service request assigned to the logged-in technician
exports.updateRequestStatus = (req, res) => {
    const { id } = req.params;
    const { request_status } = req.body;

    const user_id = req.user.user_id;

    // Only allow accepting or rejecting requests
    const allowedStatuses = ["accepted", "rejected"];

    if (!allowedStatuses.includes(request_status)) {
        return res.status(400).json({
            message: "Invalid request status"
        });
    }

    // Find the technician profile belonging to the logged-in user
    const technicianSql = `
        SELECT technician_id
        FROM technician_profiles
        WHERE user_id = ?
    `;

    db.query(technicianSql, [user_id], (err, results) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Error finding technician profile"
            });
        }

        if (results.length === 0) {
            return res.status(403).json({
                message: "Only technicians can update requests"
            });
        }

        const technician_id = results[0].technician_id;

        // Update only requests assigned to this technician
        // that are still pending
        const updateSql = `
            UPDATE service_requests
            SET request_status = ?
            WHERE request_id = ?
            AND technician_id = ?
            AND request_status = 'pending'
        `;

        db.query(
            updateSql,
            [
                request_status,
                id,
                technician_id
            ],
            (updateErr, result) => {
                if (updateErr) {
                    console.error(updateErr);

                    return res.status(500).json({
                        message: "Error updating service request"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message:
                            "Request not found, already processed, or not assigned to you"
                    });
                }

                return res.status(200).json({
                    message: `Service request ${request_status} successfully`,
                    request_id: id,
                    request_status
                });
            }
        );
    });
};

// Mark an accepted service request as completed
exports.completeRequest = (req, res) => {
    const { id } = req.params;

    const user_id = req.user.user_id;

    const technicianSql = `
        SELECT technician_id
        FROM technician_profiles
        WHERE user_id = ?
    `;

    db.query(technicianSql, [user_id], (err, results) => {
        if (err) {
            console.error("Error finding technician profile:", err);
            return res.status(500).json({
                message: "Error finding technician profile"
            });
        }

        if (results.length === 0) {
            return res.status(403).json({
                message: "Only technicians can complete service requests"
            });
        }

        const technician_id = results[0].technician_id;

        const updateSql = `
            UPDATE service_requests
            SET request_status = 'completed'
            WHERE request_id = ?
            AND technician_id = ?
            AND request_status = 'accepted'
        `;

        db.query(
            updateSql,
            [id, technician_id],
            (updateErr, result) => {
                if (updateErr) {
                    console.error(
                        "Error completing service request:",
                        updateErr
                    );

                    return res.status(500).json({
                        message: "Error completing service request"
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message:
                            "Request not found, not assigned to you, or is not currently accepted"
                    });
                }

                return res.status(200).json({
                    message: "Service request completed successfully",
                    request_id: id,
                    request_status: "completed"
                });
            }
        );
    });
};

// Get service requests for the logged-in client only

// Get service requests for the logged-in client only
exports.getMyRequests = (req, res) => {
    const clientId = req.user.user_id;

    const sql = `
        SELECT
            sr.request_id,
            sr.client_id,
            sr.technician_id,

            technician.full_name AS technician_name,

            CASE
                WHEN sr.request_status = 'accepted'
                THEN technician.phone
                ELSE NULL
            END AS technician_phone,

            CASE
                WHEN sr.request_status = 'accepted'
                THEN technician.email
                ELSE NULL
            END AS technician_email,

            sr.service_description,
            sr.service_address,
            sr.service_date,
            sr.service_time,
            sr.request_status,
            sr.request_date,

            CASE
                WHEN r.review_id IS NOT NULL
                THEN 1
                ELSE 0
            END AS has_review

        FROM service_requests sr

        JOIN technician_profiles tp
            ON sr.technician_id = tp.technician_id

        JOIN users technician
            ON tp.user_id = technician.user_id

        LEFT JOIN reviews r
            ON r.request_id = sr.request_id

        WHERE sr.client_id = ?

        ORDER BY sr.request_id DESC
    `;

    db.query(sql, [clientId], (err, results) => {
        if (err) {
            console.error("Error fetching client requests:", err);
            return res.status(500).json({
                message: "Error fetching your service requests"
            });
        }

        return res.status(200).json(results);
    });
};