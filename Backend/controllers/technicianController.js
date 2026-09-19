const db = require("../config/db");
const fs = require("fs");
const { analyzeDocument } = require("../services/geminiService");


// ======================================================
// Get All Verified Technicians
// ======================================================

exports.getAllTechnicians = (req, res) => {

    const sql = `
        SELECT
            tp.technician_id,
            tp.user_id,
            u.full_name,
            u.email,
            u.phone,
            c.category_name,
            tp.bio,
            tp.years_experience,
            tp.location,
            tp.is_verified

        FROM technician_profiles tp

        JOIN users u
            ON tp.user_id = u.user_id

        JOIN categories c
            ON tp.category_id = c.category_id

        WHERE tp.is_verified = 1

        ORDER BY tp.technician_id DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching technicians",
                error: err
            });
        }

        res.status(200).json(results);

    });

};


// ======================================================
// Get Technician By ID
// ======================================================

exports.getTechnicianById = (req, res) => {

    const { id } = req.params;

    const sql = `
        SELECT
            tp.technician_id,
            tp.user_id,
            u.full_name,
            u.email,
            u.phone,
            c.category_name,
            tp.bio,
            tp.years_experience,
            tp.location,
            tp.is_verified

        FROM technician_profiles tp

        JOIN users u
            ON tp.user_id = u.user_id

        JOIN categories c
            ON tp.category_id = c.category_id

        WHERE tp.technician_id = ?
        AND tp.is_verified = 1
    `;

    db.query(sql, [id], (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching technician",
                error: err
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Technician not found"
            });
        }

        res.status(200).json(results[0]);

    });

};


// ======================================================
// Get Technicians By Category
// ======================================================

exports.getTechniciansByCategory = (req, res) => {

    const { categoryId } = req.params;

    const sql = `
        SELECT
            tp.technician_id,
            tp.user_id,
            u.full_name,
            u.email,
            u.phone,
            c.category_name,
            tp.bio,
            tp.years_experience,
            tp.location,
            tp.is_verified

        FROM technician_profiles tp

        JOIN users u
            ON tp.user_id = u.user_id

        JOIN categories c
            ON tp.category_id = c.category_id

        WHERE tp.category_id = ?

        ORDER BY tp.technician_id DESC
    `;

    db.query(sql, [categoryId], (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching technicians",
                error: err
            });
        }

        res.status(200).json(results);

    });

};


// ======================================================
// Verify Technician
// Admin Only
// ======================================================

exports.verifyTechnician = (req, res) => {

    const { id } = req.params;

    const sql1 = `
        UPDATE technician_profiles
        SET is_verified = 1
        WHERE technician_id = ?
    `;

    db.query(sql1, [id], (err, result) => {

        if (err) {
            return res.status(500).json({
                message: "Error verifying technician",
                error: err
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Technician not found"
            });
        }

        const sql2 = `
            UPDATE verification_documents
            SET verification_status = 'approved'
            WHERE technician_id = ?
        `;

        db.query(sql2, [id], (err2) => {

            if (err2) {
                return res.status(500).json({
                    message:
                        "Technician verified but document status update failed",
                    error: err2
                });
            }

            res.status(200).json({
                message:
                    "Technician and documents verified successfully"
            });

        });

    });

};


// ======================================================
// Upload Verification Document
// Gemini AI Verification
// ======================================================

exports.uploadVerificationDocument = (req, res) => {

    const {
        technician_id,
        document_type
    } = req.body;


    // ---------------------------------------------
    // Check that a file was uploaded
    // ---------------------------------------------

    if (!req.file) {

        return res.status(400).json({
            message: "Please upload a verification document."
        });

    }


    // ---------------------------------------------
    // Check required fields
    // ---------------------------------------------

    if (!technician_id || !document_type) {

        try {
            fs.unlinkSync(req.file.path);
        } catch (error) {
            console.log(
                "Could not delete uploaded file:",
                error
            );
        }

        return res.status(400).json({
            message:
                "technician_id and document_type are required."
        });

    }


    // ---------------------------------------------
    // Verify technician ownership
    // ---------------------------------------------

    const ownershipSql = `
        SELECT technician_id
        FROM technician_profiles
        WHERE technician_id = ?
        AND user_id = ?
    `;

    db.query(
        ownershipSql,
        [
            technician_id,
            req.user.user_id
        ],
        async (err, results) => {

            if (err) {

                try {
                    fs.unlinkSync(req.file.path);
                } catch (error) {
                    console.log(
                        "Could not delete uploaded file:",
                        error
                    );
                }

                return res.status(500).json({
                    message:
                        "Error checking technician ownership.",
                    error: err
                });

            }


            // -----------------------------------------
            // Technician does not belong to user
            // -----------------------------------------

            if (results.length === 0) {

                try {
                    fs.unlinkSync(req.file.path);
                } catch (error) {
                    console.log(
                        "Could not delete uploaded file:",
                        error
                    );
                }

                return res.status(403).json({
                    message:
                        "You can only upload documents for your own technician profile."
                });

            }


            // -----------------------------------------
            // Create database path
            // -----------------------------------------

            const document_path =
                `documents/${req.file.filename}`;


            // -----------------------------------------
            // Save document information
            // -----------------------------------------

            const sql = `
                INSERT INTO verification_documents
                (
                    technician_id,
                    document_type,
                    document_path
                )
                VALUES (?, ?, ?)
            `;

            db.query(
                sql,
                [
                    technician_id,
                    document_type,
                    document_path
                ],
                async (err, result) => {

                    if (err) {

                        try {
                            fs.unlinkSync(req.file.path);
                        } catch (error) {
                            console.log(
                                "Could not delete uploaded file:",
                                error
                            );
                        }

                        return res.status(500).json({
                            message:
                                "Error saving verification document.",
                            error: err
                        });

                    }


                    // -----------------------------------------
                    // Document successfully saved
                    // -----------------------------------------

                    const document_id = result.insertId;


                    // -----------------------------------------
                    // Run Gemini AI analysis
                    // -----------------------------------------

                    console.log(
                        "Starting Gemini AI verification..."
                    );

                    let aiResult;

                    try {

                        aiResult = await analyzeDocument(
                            req.file.path,
                            req.file.mimetype
                        );

                        console.log(
                            "Gemini AI verification completed."
                        );

                    } catch (aiError) {

                        console.error(
                            "Gemini AI verification failed:",
                            aiError.message
                        );

                        return res.status(201).json({

                            message:
                                "Verification document uploaded, but AI analysis failed.",

                            document: {
                                document_id: document_id,
                                technician_id: Number(technician_id),
                                document_type: document_type,
                                document_path: document_path,
                                verification_status: "pending",

                                file_url:
                                    `http://localhost:5000/uploads/${document_path}`
                            },

                            ai_verification: {
                                status: "failed",
                                message:
                                    "AI analysis could not be completed. Admin review is required."
                            }

                        });

                    }


                    // -----------------------------------------
                    // Save Gemini result
                    // -----------------------------------------

                    const aiSql = `
                        INSERT INTO ai_verifications
                        (
                            document_id,
                            confidence_score,
                            verification_result,
                            verified_by,
                            remarks
                        )
                        VALUES (?, ?, ?, ?, ?)
                    `;

                    db.query(
                        aiSql,
                        [
                            document_id,
                            aiResult.confidence_score,
                            aiResult.verification_result,
                            "Gemini AI",
                            aiResult.remarks
                        ],
                        (aiErr, aiInsertResult) => {

                            if (aiErr) {

                                console.error(
                                    "AI result database error:",
                                    aiErr
                                );

                                return res.status(500).json({
                                    message:
                                        "Document uploaded and AI analyzed it, but AI result could not be saved.",
                                    error: aiErr
                                });

                            }


                            // -----------------------------------------
                            // Final response
                            // -----------------------------------------

                            res.status(201).json({

                                message:
                                    "Verification document uploaded and analyzed successfully.",

                                document: {

                                    document_id:
                                        document_id,

                                    technician_id:
                                        Number(technician_id),

                                    document_type:
                                        document_type,

                                    document_path:
                                        document_path,

                                    verification_status:
                                        "pending",

                                    file_url:
                                        `http://localhost:5000/uploads/${document_path}`

                                },

                                ai_verification: {

                                    verification_id:
                                        aiInsertResult.insertId,

                                    verification_result:
                                        aiResult.verification_result,

                                    confidence_score:
                                        aiResult.confidence_score,

                                    document_type:
                                        aiResult.document_type,

                                    remarks:
                                        aiResult.remarks

                                }

                            });

                        }

                    );

                }

            );

        }

    );

};


// ======================================================
// Get Pending Technicians
// Admin Only
// ======================================================

exports.getPendingTechnicians = (req, res) => {

    const sql = `
        SELECT
            tp.technician_id,
            u.full_name,
            tp.bio,
            tp.location,
            vd.document_type,
            vd.document_path,
            vd.verification_status

        FROM technician_profiles tp

        JOIN users u
            ON tp.user_id = u.user_id

        JOIN verification_documents vd
            ON tp.technician_id = vd.technician_id

        WHERE vd.verification_status = 'pending'
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Error fetching technicians",
                error: err
            });
        }

        res.status(200).json(results);

    });

};


// ======================================================
// Create Technician Profile
// ======================================================

exports.createProfile = (req, res) => {

    const user_id = req.user.user_id;

    const {
        category_id,
        bio,
        years_experience,
        location,
        employment_type
    } = req.body;


    const checkSql = `
        SELECT technician_id
        FROM technician_profiles
        WHERE user_id = ?
    `;

    db.query(
        checkSql,
        [user_id],
        (checkErr, checkResults) => {

            if (checkErr) {
                return res.status(500).json(checkErr);
            }

            if (checkResults.length > 0) {

                return res.status(409).json({
                    message:
                        "Technician profile already exists"
                });

            }


            const insertSql = `
                INSERT INTO technician_profiles
                (
                    user_id,
                    category_id,
                    bio,
                    years_experience,
                    location,
                    employment_type
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(
                insertSql,
                [
                    user_id,
                    category_id,
                    bio,
                    years_experience,
                    location,
                    employment_type
                ],
                (err, result) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.status(201).json({

                        message:
                            "Technician profile created successfully",

                        technician_id:
                            result.insertId

                    });

                }
            );

        }

    );

};

// Get AI verification results for admin review
exports.getAIVerificationResults = (req, res) => {

    const sql = `
        SELECT
            av.verification_id,
            av.document_id,
            av.verification_result,
            av.confidence_score,
            av.verification_date,
            av.verified_by,
            av.remarks,

            vd.technician_id,
            vd.document_type,
            vd.document_path,
            vd.verification_status,
            vd.uploaded_at,

            u.user_id,
            u.full_name,
            u.email,
            u.phone

        FROM ai_verifications av

        JOIN verification_documents vd
            ON av.document_id = vd.document_id

        JOIN technician_profiles tp
            ON vd.technician_id = tp.technician_id

        JOIN users u
            ON tp.user_id = u.user_id

        ORDER BY av.verification_date DESC
    `;

    db.query(sql, (err, results) => {

        if (err) {

            console.error(
                "Error fetching AI verification results:",
                err
            );

            return res.status(500).json({
                message: "Failed to fetch AI verification results.",
                error: err
            });
        }

        res.status(200).json(results);
    });
};

// ======================================================
// Admin Final Review of Verification Document
// Admin Only
// ======================================================

exports.reviewVerificationDocument = (req, res) => {

    const { documentId } = req.params;
    const { decision } = req.body;

    // ---------------------------------------------
    // Validate admin decision
    // ---------------------------------------------

    if (!decision || !["approved", "rejected"].includes(decision)) {

        return res.status(400).json({
            message:
                "Decision must be either 'approved' or 'rejected'."
        });

    }

    // ---------------------------------------------
    // Get technician ID for this document
    // ---------------------------------------------

    const getDocumentSql = `
        SELECT technician_id
        FROM verification_documents
        WHERE document_id = ?
    `;

    db.query(
        getDocumentSql,
        [documentId],
        (err, results) => {

            if (err) {

                console.error(
                    "Error finding verification document:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Error finding verification document.",
                    error: err
                });

            }

            if (results.length === 0) {

                return res.status(404).json({
                    message:
                        "Verification document not found."
                });

            }

            const technicianId =
                results[0].technician_id;


            // -----------------------------------------
            // Update verification document
            // -----------------------------------------

            const updateDocumentSql = `
                UPDATE verification_documents
                SET verification_status = ?
                WHERE document_id = ?
            `;

            db.query(
                updateDocumentSql,
                [
                    decision,
                    documentId
                ],
                (updateErr) => {

                    if (updateErr) {

                        console.error(
                            "Error updating verification document:",
                            updateErr
                        );

                        return res.status(500).json({
                            message:
                                "Error updating verification document.",
                            error: updateErr
                        });

                    }


                    // ---------------------------------
                    // Update technician verification
                    // ---------------------------------

                    const verifiedValue =
                        decision === "approved" ? 1 : 0;

                    const updateTechnicianSql = `
                        UPDATE technician_profiles
                        SET is_verified = ?
                        WHERE technician_id = ?
                    `;

                    db.query(
                        updateTechnicianSql,
                        [
                            verifiedValue,
                            technicianId
                        ],
                        (technicianErr) => {

                            if (technicianErr) {

                                console.error(
                                    "Error updating technician verification:",
                                    technicianErr
                                );

                                return res.status(500).json({
                                    message:
                                        "Document reviewed, but technician verification update failed.",
                                    error: technicianErr
                                });

                            }


                            // ---------------------------------
                            // Successful final review
                            // ---------------------------------

                            res.status(200).json({

                                message:
                                    `Verification document ${decision} successfully.`,

                                document_id:
                                    Number(documentId),

                                technician_id:
                                    technicianId,

                                decision:
                                    decision,

                                technician_verified:
                                    verifiedValue === 1

                            });

                        }
                    );

                }
            );

        }
    );

};