const db = require("../config/db");

exports.createServiceRequest = (req, res) => {

    const client_id = req.user.user_id;

const {

    technician_id,

    service_description,

    service_address,

    service_date

} = req.body;

    const sql = `
        INSERT INTO service_requests
        (
            client_id,
            technician_id,
            service_description,
            service_address,
            service_date
        )

        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(

        sql,

        [

            client_id,
            technician_id,
            service_description,
            service_address,
            service_date

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

        SELECT *

        FROM service_requests

        WHERE technician_id = ?

        ORDER BY request_id DESC

    `;

    db.query(sql, [technicianId], (err, results) => {

        if (err) {

            return res.status(500).json({

                message: "Error fetching requests",
                error: err

            });

        }

        res.status(200).json(results);

    });

};

exports.updateRequestStatus = (req, res) => {

    const { id } = req.params;

    const { request_status } = req.body;

    const sql = `

        UPDATE service_requests

        SET request_status = ?

        WHERE request_id = ?

    `;

    db.query(

        sql,

        [

            request_status,

            id

        ],

        (err, result) => {

            if (err) {

                return res.status(500).json({

                    message: "Error updating request",
                    error: err

                });

            }

            res.status(200).json({

                message: "Request updated successfully"

            });

        }

    );

};