const agencyModel = require("../models/agencyModel");
const db = require("../config/db");


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

    // Find the agency profile belonging to the logged-in user.
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
                    message: "Create your agency profile before uploading documents."
                });
            }

            const agencyId = agencies[0].agency_id;

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
                [
                    agencyId,
                    documentType,
                    "/" + req.file.path.replace(/\\/g, "/")
                ],
                (insertErr, result) => {

                    if (insertErr) {
                        console.error("Agency document upload error:", insertErr);

                        return res.status(500).json({
                            message: "Failed to save agency verification document.",
                            error: insertErr
                        });
                    }

                    return res.status(201).json({
                        message: "Verification document uploaded successfully.",
                        document_id: result.insertId,
                        agency_id: agencyId,
                        document_type: documentType,
                        verification_status: "Pending"
                    });

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

        const documentSql = `
            SELECT
                document_id,
                agency_id,
                document_type,
                document_path,
                uploaded_at,
                verification_status
            FROM documents
            WHERE agency_id IN (?)
            ORDER BY uploaded_at DESC
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
    getMyAgencyDocuments

};