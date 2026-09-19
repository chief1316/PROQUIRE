const db = require("../config/db");


// =====================================================
// Create Client Profile
// =====================================================

exports.createClientProfile = (req, res) => {

    const user_id = req.user.user_id;

    const {
        location
    } = req.body;


    // Check if location was provided
    if (!location) {
        return res.status(400).json({
            message: "location is required."
        });
    }


    // Check if the user already has a client profile
    const checkSql = `
        SELECT
            client_id,
            user_id,
            location
        FROM client_profiles
        WHERE user_id = ?
    `;

    db.query(
        checkSql,
        [user_id],
        (err, results) => {

            if (err) {
                console.error(
                    "Error checking client profile:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to check client profile.",
                    error: err
                });
            }


            if (results.length > 0) {
                return res.status(409).json({
                    message:
                        "Client profile already exists."
                });
            }


            // Create client profile
            const insertSql = `
                INSERT INTO client_profiles
                (
                    user_id,
                    location
                )
                VALUES (?, ?)
            `;

            db.query(
                insertSql,
                [
                    user_id,
                    location
                ],
                (err, result) => {

                    if (err) {
                        console.error(
                            "Error creating client profile:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to create client profile.",
                            error: err
                        });
                    }


                    res.status(201).json({
                        message:
                            "Client profile created successfully.",
                        client_profile: {
                            client_id:
                                result.insertId,
                            user_id:
                                user_id,
                            location:
                                location
                        }
                    });

                }
            );

        }
    );
};


// =====================================================
// Get My Client Profile
// =====================================================

exports.getMyClientProfile = (req, res) => {

    const user_id = req.user.user_id;


    const sql = `
        SELECT
            cp.client_id,
            cp.user_id,
            u.full_name,
            u.email,
            u.phone,
            cp.location
        FROM client_profiles cp
        JOIN users u
            ON cp.user_id = u.user_id
        WHERE cp.user_id = ?
    `;


    db.query(
        sql,
        [user_id],
        (err, results) => {

            if (err) {
                console.error(
                    "Error fetching client profile:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to fetch client profile.",
                    error: err
                });
            }


            if (results.length === 0) {
                return res.status(404).json({
                    message:
                        "Client profile not found."
                });
            }


            res.status(200).json(
                results[0]
            );

        }
    );
};


// =====================================================
// Get Client Profile By ID
// =====================================================

exports.getClientProfileById = (req, res) => {

    const {
        clientId
    } = req.params;


    const sql = `
        SELECT
            cp.client_id,
            cp.user_id,
            u.full_name,
            u.email,
            u.phone,
            cp.location
        FROM client_profiles cp
        JOIN users u
            ON cp.user_id = u.user_id
        WHERE cp.client_id = ?
    `;


    db.query(
        sql,
        [clientId],
        (err, results) => {

            if (err) {
                console.error(
                    "Error fetching client profile:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to fetch client profile.",
                    error: err
                });
            }


            if (results.length === 0) {
                return res.status(404).json({
                    message:
                        "Client profile not found."
                });
            }


            res.status(200).json(
                results[0]
            );

        }
    );
};


// =====================================================
// Update Client Profile
// =====================================================

exports.updateClientProfile = (req, res) => {

    const user_id = req.user.user_id;

    const {
        location
    } = req.body;


    if (!location) {
        return res.status(400).json({
            message: "location is required."
        });
    }


    // Make sure the profile belongs to the logged-in user
    const checkSql = `
        SELECT
            client_id,
            location
        FROM client_profiles
        WHERE user_id = ?
    `;


    db.query(
        checkSql,
        [user_id],
        (err, results) => {

            if (err) {
                console.error(
                    "Error checking client profile:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to check client profile.",
                    error: err
                });
            }


            if (results.length === 0) {
                return res.status(404).json({
                    message:
                        "Client profile not found."
                });
            }


            const client_id =
                results[0].client_id;


            const updateSql = `
                UPDATE client_profiles
                SET location = ?
                WHERE client_id = ?
            `;


            db.query(
                updateSql,
                [
                    location,
                    client_id
                ],
                (err) => {

                    if (err) {
                        console.error(
                            "Error updating client profile:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to update client profile.",
                            error: err
                        });
                    }


                    res.status(200).json({
                        message:
                            "Client profile updated successfully.",
                        client_profile: {
                            client_id:
                                client_id,
                            user_id:
                                user_id,
                            location:
                                location
                        }
                    });

                }
            );

        }
    );
};


// =====================================================
// Delete Client Profile
// =====================================================

exports.deleteClientProfile = (req, res) => {

    const user_id = req.user.user_id;


    const checkSql = `
        SELECT
            client_id
        FROM client_profiles
        WHERE user_id = ?
    `;


    db.query(
        checkSql,
        [user_id],
        (err, results) => {

            if (err) {
                console.error(
                    "Error checking client profile:",
                    err
                );

                return res.status(500).json({
                    message:
                        "Failed to check client profile.",
                    error: err
                });
            }


            if (results.length === 0) {
                return res.status(404).json({
                    message:
                        "Client profile not found."
                });
            }


            const client_id =
                results[0].client_id;


            const deleteSql = `
                DELETE FROM client_profiles
                WHERE client_id = ?
            `;


            db.query(
                deleteSql,
                [client_id],
                (err) => {

                    if (err) {
                        console.error(
                            "Error deleting client profile:",
                            err
                        );

                        return res.status(500).json({
                            message:
                                "Failed to delete client profile.",
                            error: err
                        });
                    }


                    res.status(200).json({
                        message:
                            "Client profile deleted successfully.",
                        client_id:
                            client_id
                    });

                }
            );

        }
    );
};