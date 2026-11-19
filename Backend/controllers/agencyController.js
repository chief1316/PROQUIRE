const agencyModel = require("../models/agencyModel");

const db = require("../config/db");

const { analyzeDocument } = require("../services/geminiService");


/*
|--------------------------------------------------------------------------
| Create Agency Profile
|--------------------------------------------------------------------------
*/

const createAgency = (req, res) => {

    // Only agencies can create agency profiles
    if (req.user.role !== "agency") {

        return res.status(403).json({
            message:
                "Only agency accounts can create agency profiles."
        });

    }

    // Check if the logged-in user already has an agency profile
    agencyModel.getAgencyByUserId(
        req.user.user_id,
        (err, agencies) => {

            if (err) {

                return res.status(500).json(err);

            }

            if (agencies.length > 0) {

                return res.status(400).json({
                    message:
                        "Agency profile already exists."
                });

            }


            /*
            |--------------------------------------------------------------------------
            | Get contact details from users table
            |--------------------------------------------------------------------------
            */

            const userSql = `
                SELECT
                    email,
                    phone
                FROM users
                WHERE user_id = ?
            `;

            db.query(
                userSql,
                [req.user.user_id],
                (userErr, userResults) => {

                    if (userErr) {

                        return res.status(500).json({
                            message:
                                "Failed to retrieve agency contact details.",
                            error: userErr
                        });

                    }

                    if (userResults.length === 0) {

                        return res.status(404).json({
                            message:
                                "Agency user account not found."
                        });

                    }

                    const user = userResults[0];


                    /*
                    |--------------------------------------------------------------------------
                    | Create agency profile
                    |--------------------------------------------------------------------------
                    */

                    const agencyData = {

                        user_id:
                            req.user.user_id,

                        company_name:
                            req.body.company_name,

                        registration_number:
                            req.body.registration_number,

                        kra_pin:
                            req.body.kra_pin,

                        email:
                            user.email,

                        phone:
                            user.phone,

                        county:
                            req.body.county,

                        address:
                            req.body.address,

                        description:
                            req.body.description,

                        logo:
                            req.file
                                ? req.file.path
                                : null

                    };


                    agencyModel.createAgency(
                        agencyData,
                        (err, result) => {

                            if (err) {

                                return res.status(500).json({
                                    message:
                                        "Failed to create agency profile.",
                                    error: err
                                });

                            }

                            res.status(201).json({

                                message:
                                    "Agency profile created successfully.",

                                agency_id:
                                    result.insertId

                            });

                        }
                    );

                }
            );

        }
    );

};


/*
|--------------------------------------------------------------------------
| Get All Agencies
|--------------------------------------------------------------------------
*/

const getAllAgencies = (req, res) => {

    agencyModel.getAllAgencies(
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message:
                        "Failed to fetch agencies.",
                    error: err
                });

            }

            res.status(200).json(result);

        }
    );

};


/*
|--------------------------------------------------------------------------
| Get Agency By ID
|--------------------------------------------------------------------------
*/

const getAgencyById = (req, res) => {

    agencyModel.getAgencyById(
        req.params.id,
        (err, result) => {

            if (err) {

                return res.status(500).json(err);

            }

            if (result.length === 0) {

                return res.status(404).json({
                    message:
                        "Agency not found."
                });

            }

            res.json(result[0]);

        }
    );

};


/*
|--------------------------------------------------------------------------
| Get Logged-in Agency
|--------------------------------------------------------------------------
*/

const getMyAgency = (req, res) => {

    agencyModel.getAgencyByUserId(
        req.user.user_id,
        (err, result) => {

            if (err) {

                return res.status(500).json(err);

            }

            if (result.length === 0) {

                return res.status(404).json({
                    message:
                        "Agency profile not found."
                });

            }

            res.json(result[0]);

        }
    );

};


/*
|--------------------------------------------------------------------------
| Update Agency
|--------------------------------------------------------------------------
*/

const updateAgency = (req, res) => {

    // Verify ownership
    agencyModel.getAgencyById(
        req.params.id,
        (err, result) => {

            if (err) {

                return res.status(500).json(err);

            }

            if (result.length === 0) {

                return res.status(404).json({
                    message:
                        "Agency not found."
                });

            }

            if (
                result[0].user_id !==
                req.user.user_id
            ) {

                return res.status(403).json({
                    message:
                        "You are not allowed to update this agency."
                });

            }


            /*
            |--------------------------------------------------------------------------
            | Get current user contact details
            |--------------------------------------------------------------------------
            */

            const userSql = `
                SELECT
                    email,
                    phone
                FROM users
                WHERE user_id = ?
            `;

            db.query(
                userSql,
                [req.user.user_id],
                (userErr, userResults) => {

                    if (userErr) {

                        return res.status(500).json({
                            message:
                                "Failed to retrieve agency contact details.",
                            error: userErr
                        });

                    }

                    if (userResults.length === 0) {

                        return res.status(404).json({
                            message:
                                "Agency user account not found."
                        });

                    }

                    const user = userResults[0];


                    const agencyData = {

                        company_name:
                            req.body.company_name,

                        registration_number:
                            req.body.registration_number,

                        kra_pin:
                            req.body.kra_pin,

                        email:
                            user.email,

                        phone:
                            user.phone,

                        county:
                            req.body.county,

                        address:
                            req.body.address,

                        description:
                            req.body.description,

                        logo:
                            req.file
                                ? req.file.path
                                : result[0].logo

                    };


                    agencyModel.updateAgency(
                        req.params.id,
                        agencyData,
                        (err) => {

                            if (err) {

                                return res.status(500).json(err);

                            }

                            res.json({
                                message:
                                    "Agency updated successfully."
                            });

                        }
                    );

                }
            );

        }
    );

};


/*
|--------------------------------------------------------------------------
| Delete Agency
|--------------------------------------------------------------------------
*/

const deleteAgency = (req, res) => {

    agencyModel.getAgencyById(
        req.params.id,
        (err, result) => {

            if (err) {

                return res.status(500).json(err);

            }

            if (result.length === 0) {

                return res.status(404).json({
                    message:
                        "Agency not found."
                });

            }

            if (
                result[0].user_id !==
                req.user.user_id
            ) {

                return res.status(403).json({
                    message:
                        "You are not allowed to delete this agency."
                });

            }

            agencyModel.deleteAgency(
                req.params.id,
                (err) => {

                    if (err) {

                        return res.status(500).json(err);

                    }

                    res.json({
                        message:
                            "Agency deleted successfully."
                    });

                }
            );

        }
    );

};


/*
|--------------------------------------------------------------------------
| Upload Agency Verification Document
|--------------------------------------------------------------------------
*/


const uploadAgencyDocument = (req, res) => {

    if (req.user.role !== "agency") {
        return res.status(403).json({
            message: "Only agency accounts can upload verification documents."
        });
    }

    if (!req.file) {
        return res.status(400).json({
            message: "Please select a PDF document to upload."
        });
    }

    const documentType = req.body.document_type;

    if (!documentType) {
        return res.status(400).json({
            message: "Please select a document type."
        });
    }

    agencyModel.getAgencyByUserId(
        req.user.user_id,
        (err, agencies) => {

            if (err) {
                console.error("Agency retrieval error:", err);

                return res.status(500).json({
                    message: "Failed to retrieve agency profile.",
                    error: err
                });
            }

            if (!agencies || agencies.length === 0) {
                return res.status(404).json({
                    message: "Create your agency profile before uploading documents."
                });
            }

            const agencyId = agencies[0].agency_id;

            const documentPath =
                "/" + req.file.path.replace(/\\/g, "/");

            // Save the document first.
            // It remains Pending regardless of Gemini's recommendation.

            const sql = `
                INSERT INTO documents (
                    agency_id,
                    document_type,
                    document_path,
                    verification_status
                )
                VALUES (?, ?, ?, 'Pending')
            `;

            db.query(
                sql,
                [agencyId, documentType, documentPath],
                (insertErr, result) => {

                    if (insertErr) {
                        console.error(
                            "Agency document upload error:",
                            insertErr
                        );

                        return res.status(500).json({
                            message: "Failed to save agency verification document.",
                            error: insertErr
                        });
                    }

                    const documentId = result.insertId;

                    console.log(
                        `Agency document ${documentId} saved successfully.`
                    );

                    // Reset agency verification so a newly uploaded
                    // document enters the admin review queue.

                    db.query(
                        `
                        UPDATE agency_profiles
                        SET is_verified = 0
                        WHERE agency_id = ?
                        `,
                        [agencyId],
                        (updateErr) => {

                            if (updateErr) {
                                console.error(
                                    "Failed to reset agency verification status:",
                                    updateErr
                                );
                            }

                            // Analyze the uploaded PDF using Gemini.
                            // AI analysis must never determine final approval.

                            (async () => {

                                let aiResult = null;
                                let aiSaved = false;

                                try {

                                    aiResult = await analyzeDocument(
                                        req.file.path,
                                        req.file.mimetype,
                                        "agency"
                                    );

                                    // Save Gemini's recommendation separately.

                                    const aiSql = `
                                        INSERT INTO agency_ai_verifications (
                                            document_id,
                                            confidence_score,
                                            verification_result,
                                            verified_by,
                                            remarks
                                        )
                                        VALUES (?, ?, ?, 'Gemini AI', ?)
                                    `;

                                    await new Promise((resolve, reject) => {

                                        db.query(
                                            aiSql,
                                            [
                                                documentId,
                                                aiResult.confidence_score,
                                                aiResult.verification_result,
                                                aiResult.remarks
                                            ],
                                            (aiErr) => {

                                                if (aiErr) {
                                                    return reject(aiErr);
                                                }

                                                resolve();
                                            }
                                        );

                                    });

                                    aiSaved = true;

                                } catch (aiError) {

                                    console.error(
                                        "Agency Gemini verification failed:",
                                        aiError
                                    );

                                }

                                // Respond after AI analysis.
                                // The document always remains Pending
                                // until an administrator reviews it.

                                return res.status(201).json({

                                    message: aiResult
                                        ? "Document uploaded and AI analysis completed. Awaiting administrator verification."
                                        : "Document uploaded successfully. AI analysis was unsuccessful; administrator review is required.",

                                    document_id: documentId,

                                    agency_id: agencyId,

                                    document_type: documentType,

                                    verification_status: "Pending",

                                    ai_analysis: aiResult
                                        ? {
                                            saved: aiSaved,
                                            verification_result:
                                                aiResult.verification_result,
                                            confidence_score:
                                                aiResult.confidence_score,
                                            document_type:
                                                aiResult.document_type,
                                            remarks:
                                                aiResult.remarks
                                        }
                                        : {
                                            saved: false,
                                            verification_result: "review",
                                            remarks: "AI analysis unavailable. Manual administrator review is required."
                                        },

                                    admin_verification_required: true,

                                    agency_status_reset: !updateErr

                                });

                            })();

                        }
                    );

                }
            );

        }
    );

};



/*
|--------------------------------------------------------------------------
| Get Logged-in Agency Documents
|--------------------------------------------------------------------------
*/

const getMyAgencyDocuments = (req, res) => {

    if (req.user.role !== "agency") {
        return res.status(403).json({
            message: "Only agency accounts can view agency documents."
        });
    }

    agencyModel.getAgencyByUserId(
        req.user.user_id,
        (err, agencies) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to retrieve agency profile.",
                    error: err
                });
            }

            if (!agencies || agencies.length === 0) {
                return res.status(404).json({
                    message: "Agency profile not found."
                });
            }

            const sql = `
                SELECT
                    document_id,
                    document_type,
                    document_path,
                    uploaded_at,
                    verification_status
                FROM documents
                WHERE agency_id = ?
                ORDER BY uploaded_at DESC
            `;

            db.query(
                sql,
                [agencies[0].agency_id],
                (docErr, documents) => {

                    if (docErr) {
                        return res.status(500).json({
                            message: "Failed to retrieve agency documents.",
                            error: docErr
                        });
                    }

                    res.status(200).json(documents);

                }
            );

        }
    );

};




/*
|--------------------------------------------------------------------------
| Get Pending Agencies
|--------------------------------------------------------------------------
*/



const getPendingAgencies = (req, res) => {

    const sql = `
        SELECT
            agency_id,
            user_id,
            company_name,
            registration_number,
            kra_pin,
            email,
            phone,
            county,
            address,
            description,
            logo,
            is_verified,
            created_at,
            updated_at
        FROM agency_profiles
        WHERE is_verified = 0
        ORDER BY agency_id DESC
    `;

    db.query(sql, (err, agencies) => {

        if (err) {

            console.error("Failed to fetch pending agencies:", err);

            return res.status(500).json({
                message: "Failed to fetch pending agencies.",
                error: err
            });

        }

        if (agencies.length === 0) {
            return res.status(200).json([]);
        }

        const agencyIds = agencies.map(
            agency => agency.agency_id
        );

        // Fetch agency documents together with Gemini AI results.
        const documentSql = `
            SELECT
                d.document_id,
                d.agency_id,
                d.document_type,
                d.document_path,
                d.uploaded_at,
                d.verification_status,

                ai.verification_id AS ai_verification_id,
                ai.confidence_score AS ai_confidence_score,
                ai.verification_result AS ai_verification_result,
                ai.verification_date AS ai_verification_date,
                ai.verified_by AS ai_verified_by,
                ai.remarks AS ai_remarks

            FROM documents d

            LEFT JOIN agency_ai_verifications ai
                ON d.document_id = ai.document_id

            WHERE d.agency_id IN (?)

            ORDER BY d.uploaded_at DESC
        `;

        db.query(documentSql, [agencyIds], (docErr, documents) => {

            if (docErr) {

                console.error("Failed to fetch agency documents:", docErr);

                return res.status(500).json({
                    message: "Failed to fetch agency documents.",
                    error: docErr
                });

            }

            const result = agencies.map(agency => ({

                ...agency,

                documents: documents.filter(
                    document =>
                        Number(document.agency_id) ===
                        Number(agency.agency_id)
                )

            }));

            console.log(
                `Pending agencies fetched: ${result.length}`
            );

            res.status(200).json(result);

        });

    });

};




/*
|--------------------------------------------------------------------------
| Verify Agency
|--------------------------------------------------------------------------
*/

const verifyAgency = (req, res) => {

    const agencyId = req.params.id;


    if (!agencyId) {

        return res.status(400).json({
            message:
                "Agency ID is required."
        });

    }


    /*
    |--------------------------------------------------------------------------
    | IMPORTANT
    |
    | The actual database table is:
    |
    | agency_profiles
    |
    | NOT:
    |
    | agencies
    |--------------------------------------------------------------------------
    */

    const sql = `
        UPDATE agency_profiles
        SET
            is_verified = 1
        WHERE agency_id = ?
    `;


    db.query(
        sql,
        [agencyId],
        (err, result) => {

            if (err) {

                console.error(
                    "Failed to verify agency:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to verify agency.",
                    error: err
                });

            }


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "Agency not found."
                });

            }


            console.log(
                `Agency ${agencyId} verified successfully.`
            );


            res.status(200).json({

                message:
                    "Agency verified successfully.",

                agency_id:
                    Number(agencyId)

            });

        }
    );

};


const updateAgencyVerificationStatus = (agencyId, callback) => {
    const sql = `
        SELECT
            COUNT(*) AS total_documents,
            SUM(
                CASE
                    WHEN d.verification_status = 'Verified' THEN 1
                    ELSE 0
                END
            ) AS approved_documents
        FROM documents d
        WHERE d.agency_id = ?
        AND NOT EXISTS (
            SELECT 1
            FROM documents newer
            WHERE newer.agency_id = d.agency_id
            AND newer.document_type = d.document_type
            AND (
                newer.uploaded_at > d.uploaded_at
                OR (
                    newer.uploaded_at = d.uploaded_at
                    AND newer.document_id > d.document_id
                )
            )
        )
    `;

    db.query(sql, [agencyId], (err, results) => {
        if (err) return callback(err);

        const total = Number(results[0].total_documents || 0);
        const approved = Number(results[0].approved_documents || 0);

        // An agency needs at least one document, and all its
        // latest documents must be approved.
        const isVerified = total > 0 && total === approved ? 1 : 0;

        db.query(
            `UPDATE agency_profiles SET is_verified = ? WHERE agency_id = ?`,
            [isVerified, agencyId],
            callback
        );
    });
};


const approveAgencyDocument = (req, res) => {
    const documentId = Number(req.params.id);

    if (!Number.isInteger(documentId) || documentId <= 0) {
        return res.status(400).json({ message: "Invalid document ID." });
    }

    db.query(
        `SELECT agency_id FROM documents WHERE document_id = ? AND agency_id IS NOT NULL`,
        [documentId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Failed to retrieve document." });
            }

            if (!results.length) {
                return res.status(404).json({ message: "Agency document not found." });
            }

            const agencyId = results[0].agency_id;

            db.query(
                `UPDATE documents
                 SET verification_status = 'Verified',
                     admin_remarks = NULL,
                     admin_reviewed_at = NOW(),
                     admin_reviewed_by = ?
                 WHERE document_id = ? AND agency_id = ?`,
                [req.user.user_id, documentId, agencyId],
                (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({ message: "Failed to approve document." });
                    }

                    updateAgencyVerificationStatus(agencyId, (statusErr) => {
                        if (statusErr) {
                            console.error("Agency status update error:", statusErr);
                            return res.status(500).json({
                                message: "Document approved, but agency status could not be updated."
                            });
                        }

                        res.json({
                            message: "Document approved successfully.",
                            document_id: documentId
                        });
                    });
                }
            );
        }
    );
};


const rejectAgencyDocument = (req, res) => {
    const documentId = Number(req.params.id);
    const reason = (req.body.reason || "").trim();

    if (!Number.isInteger(documentId) || documentId <= 0) {
        return res.status(400).json({ message: "Invalid document ID." });
    }

    if (!reason) {
        return res.status(400).json({
            message: "Please provide a reason for rejecting this document."
        });
    }

    db.query(
        `SELECT agency_id, document_type
 FROM documents
 WHERE document_id = ? AND agency_id IS NOT NULL`,
        [documentId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Failed to retrieve document." });
            }

            if (!results.length) {
                return res.status(404).json({ message: "Agency document not found." });
            }

            const agencyId = results[0].agency_id;
            const documentType = results[0].document_type;

            db.query(
                `UPDATE documents
                 SET verification_status = 'Rejected',
                     admin_remarks = ?,
                     admin_reviewed_at = NOW(),
                     admin_reviewed_by = ?
                 WHERE document_id = ? AND agency_id = ?`,
                [reason, req.user.user_id, documentId, agencyId],
                (updateErr) => {
                    if (updateErr) {
                        return res.status(500).json({ message: "Failed to reject document." });
                    }

                    updateAgencyVerificationStatus(agencyId, (statusErr) => {
                        if (statusErr) {
                            console.error("Agency status update error:", statusErr);
                            return res.status(500).json({
                                message: "Document rejected, but agency status could not be updated."
                            });
                        }

                        db.query(
    `INSERT INTO notifications
     (
         agency_id,
         document_id,
         notification_type,
         title,
         message
     )
     VALUES (?, ?, ?, ?, ?)`,
    [
        agencyId,
        documentId,
        "document_rejected",
        "Document Rejected",
        `Your ${documentType} has been rejected. Reason: ${reason}`
    ],
    (notificationErr) => {
        if (notificationErr) {
            console.error("Agency notification error:", notificationErr);
        }

        res.json({
            message: notificationErr
                ? "Document rejected successfully, but notification could not be created."
                : "Document rejected and agency notified successfully.",
            document_id: documentId,
            rejection_reason: reason
        });
    }
);
                    });
                }
            );
        }
    );
};

const getAgencyNotifications = (req, res) => {

    agencyModel.getAgencyByUserId(
        req.user.user_id,
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Agency profile not found."
                });
            }

            const agencyId = result[0].agency_id;

            db.query(
                `SELECT
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
                 ORDER BY created_at DESC`,
                [agencyId],
                (notificationErr, notifications) => {

                    if (notificationErr) {
                        console.error(
                            "Agency notifications error:",
                            notificationErr
                        );

                        return res.status(500).json({
                            message: "Failed to retrieve notifications."
                        });
                    }

                    res.json(notifications);

                }
            );

        }
    );

};


/*
|--------------------------------------------------------------------------
| Export Controllers
|--------------------------------------------------------------------------
*/

module.exports = {

    createAgency,
    getAllAgencies,
    getAgencyById,
    getMyAgency,
    updateAgency,
    deleteAgency,
    getPendingAgencies,
    verifyAgency,
    uploadAgencyDocument,
    getMyAgencyDocuments,
    approveAgencyDocument,
    rejectAgencyDocument,
    getAgencyNotifications

};