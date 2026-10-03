const db = require("../config/db");
const reviewModel = require("../models/reviewModel");

exports.createReview = (req, res) => {
    const client_id = req.user.user_id;

    const {
        request_id,
        rating,
        comment
    } = req.body;

    const numericRating = Number(rating);
    const numericRequestId = Number(request_id);

    if (
        !numericRequestId ||
        !Number.isInteger(numericRequestId)
    ) {
        return res.status(400).json({
            message: "A valid service request is required."
        });
    }

    if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
    ) {
        return res.status(400).json({
            message:
                "Rating must be a whole number between 1 and 5."
        });
    }

    /*
     * Verify that this request:
     * 1. belongs to the logged-in client
     * 2. has been assigned to a technician
     * 3. has been completed
     */
    const requestSql = `
        SELECT
            request_id,
            technician_id,
            request_status
        FROM service_requests
        WHERE request_id = ?
        AND client_id = ?
    `;

    db.query(
        requestSql,
        [numericRequestId, client_id],
        (requestErr, requestResults) => {
            if (requestErr) {
                console.error(
                    "Error checking service request:",
                    requestErr
                );

                return res.status(500).json({
                    message:
                        "Unable to verify service request."
                });
            }

            if (requestResults.length === 0) {
                return res.status(404).json({
                    message:
                        "Service request not found."
                });
            }

            const serviceRequest =
                requestResults[0];

            if (
                serviceRequest.request_status !==
                "completed"
            ) {
                return res.status(403).json({
                    message:
                        "You can only review a completed service."
                });
            }

            /*
             * Prevent more than one review
             * for the same service request.
             */
            const existingReviewSql = `
                SELECT review_id
                FROM reviews
                WHERE request_id = ?
                LIMIT 1
            `;

            db.query(
                existingReviewSql,
                [numericRequestId],
                (reviewErr, reviewResults) => {
                    if (reviewErr) {
                        console.error(
                            "Error checking existing review:",
                            reviewErr
                        );

                        return res.status(500).json({
                            message:
                                "Unable to check existing review."
                        });
                    }

                    if (reviewResults.length > 0) {
                        return res.status(409).json({
                            message:
                                "This service request has already been reviewed."
                        });
                    }

                    const insertSql = `
                        INSERT INTO reviews
                        (
                            request_id,
                            client_id,
                            technician_id,
                            rating,
                            comment
                        )
                        VALUES (?, ?, ?, ?, ?)
                    `;

                    db.query(
                        insertSql,
                        [
                            numericRequestId,
                            client_id,
                            serviceRequest.technician_id,
                            numericRating,
                            comment?.trim() || null
                        ],
                        (insertErr, result) => {
                            if (insertErr) {
                                console.error(
                                    "Error creating review:",
                                    insertErr
                                );

                                /*
                                 * Handles the UNIQUE(request_id)
                                 * constraint safely even if two
                                 * requests arrive at almost the
                                 * same time.
                                 */
                                if (
                                    insertErr.code ===
                                    "ER_DUP_ENTRY"
                                ) {
                                    return res.status(409).json({
                                        message:
                                            "This service request has already been reviewed."
                                    });
                                }

                                return res.status(500).json({
                                    message:
                                        "Error creating review",
                                    error: insertErr
                                });
                            }

                            return res.status(201).json({
                                message:
                                    "Review created successfully",
                                reviewId:
                                    result.insertId,
                                requestId:
                                    numericRequestId
                            });
                        }
                    );
                }
            );
        }
    );
};

exports.getTechnicianReviews = (req, res) => {
    const { technicianId } = req.params;

    const sql = `
        SELECT
            r.review_id,
            r.request_id,
            u.full_name AS client_name,
            r.rating,
            r.comment,
            r.review_date,
            sr.service_description
        FROM reviews r
        JOIN users u
            ON r.client_id = u.user_id
        LEFT JOIN service_requests sr
            ON r.request_id = sr.request_id
        WHERE r.technician_id = ?
        ORDER BY r.review_date DESC
    `;

    db.query(
        sql,
        [technicianId],
        (err, results) => {
            if (err) {
                console.error(
                    "Error fetching technician reviews:",
                    err
                );

                return res.status(500).json({
                    message: "Error fetching reviews",
                    error: err
                });
            }

            return res.status(200).json(results);
        }
    );
};

exports.getAverageRating = async (req, res) => {

    try {

        const technicianId = req.params.technicianId;

        const result =
            await reviewModel.getAverageRating(technicianId);

        res.status(200).json(result);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching average rating",
            error
        });

    }

};