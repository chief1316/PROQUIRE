const bcrypt = require("bcrypt");

const db = require("../config/db");

const agencyTechnicianModel = require("../models/agencyTechnicianModel");

/*
|--------------------------------------------------------------------------
| Create Technician
|--------------------------------------------------------------------------
*/

const createTechnician = async (req, res) => {

    try {

        const {
            full_name,
            email,
            phone,
            password,
            category_id,
            location,
            years_experience,
            bio
        } = req.body;

        // Find logged-in agency
        db.query(
            "SELECT agency_id FROM agency_profiles WHERE user_id = ?",
            [req.user.user_id],
            async (err, agencyResult) => {

                if (err)
                    return res.status(500).json(err);

                if (agencyResult.length === 0) {

                    return res.status(404).json({
                        message: "Agency profile not found."
                    });

                }

                const hashedPassword = await bcrypt.hash(password, 10);

                const technicianData = {

                    full_name,
                    email,
                    phone,
                    password: hashedPassword,
                    category_id,
                    location,
                    years_experience,
                    bio,
                    agency_id: agencyResult[0].agency_id

                };

                agencyTechnicianModel.createTechnician(
                    technicianData,
                    (err, result) => {

                        if (err)
                            return res.status(500).json(err);

                        res.status(201).json({
                            message: "Technician created successfully.",
                            technician_id: result.insertId
                        });

                    }
                );

            }
        );

    }

    catch (error) {

        res.status(500).json(error);

    }

};

/*
|--------------------------------------------------------------------------
| Get My Agency Technicians
|--------------------------------------------------------------------------
*/

const getAgencyTechnicians = (req, res) => {

    console.log("===== CONTROLLER HIT =====");

    console.log("JWT USER:");
    console.log(req.user);

    console.log("================================");
    console.log("INSIDE getAgencyTechnicians");
    console.log("req.user:");
    console.log(req.user);

    console.log("Searching agency for user_id:");
    console.log(req.user.user_id);

    db.query(
        "SELECT agency_id FROM agency_profiles WHERE user_id = ?",
        [req.user.user_id],
        (err, agencyResult) => {

            console.log("SQL Error:");
            console.log(err);

            console.log("Agency Result:");
            console.log(agencyResult);

            if (err)
                return res.status(500).json(err);

            if (agencyResult.length === 0) {
                return res.status(404).json({
                    message: "Agency profile not found."
                });
            }

            agencyTechnicianModel.getAgencyTechnicians(
                agencyResult[0].agency_id,
                (err, technicians) => {

                    if (err)
                        return res.status(500).json(err);

                    res.json(technicians);

                }
            );

        }
    );

};

/*
|--------------------------------------------------------------------------
| Get One Technician
|--------------------------------------------------------------------------
*/

const getTechnicianById = (req, res) => {

    agencyTechnicianModel.getTechnicianById(
        req.params.id,
        (err, result) => {

            if (err)
                return res.status(500).json(err);

            if (result.length === 0) {

                return res.status(404).json({
                    message: "Technician not found."
                });

            }

            db.query(
                "SELECT agency_id FROM agency_profiles WHERE user_id = ?",
                [req.user.user_id],
                (err, agencyResult) => {

                    if (err)
                        return res.status(500).json(err);

                    if (
                        result[0].agency_id !==
                        agencyResult[0].agency_id
                    ) {

                        return res.status(403).json({
                            message: "Access denied."
                        });

                    }

                    res.json(result[0]);

                }
            );

        }
    );

};

/*
|--------------------------------------------------------------------------
| Update Technician
|--------------------------------------------------------------------------
*/

const updateTechnician = (req, res) => {

    agencyTechnicianModel.getTechnicianById(
        req.params.id,
        (err, result) => {

            if (err)
                return res.status(500).json(err);

            if (result.length === 0) {

                return res.status(404).json({
                    message: "Technician not found."
                });

            }

            db.query(
                "SELECT agency_id FROM agency_profiles WHERE user_id = ?",
                [req.user.user_id],
                (err, agencyResult) => {

                    if (err)
                        return res.status(500).json(err);

                    if (
                        result[0].agency_id !==
                        agencyResult[0].agency_id
                    ) {

                        return res.status(403).json({
                            message: "Access denied."
                        });

                    }

                    const technicianData = {

                        category_id: req.body.category_id,
                        location: req.body.location,
                        years_experience: req.body.years_experience,
                        bio: req.body.bio

                    };

                    agencyTechnicianModel.updateTechnician(
                        req.params.id,
                        technicianData,
                        (err) => {

                            if (err)
                                return res.status(500).json(err);

                            res.json({
                                message: "Technician updated successfully."
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
| Delete Technician
|--------------------------------------------------------------------------
*/

const deleteTechnician = (req, res) => {

    agencyTechnicianModel.getTechnicianById(
        req.params.id,
        (err, result) => {

            if (err)
                return res.status(500).json(err);

            if (result.length === 0) {

                return res.status(404).json({
                    message: "Technician not found."
                });

            }

            db.query(
                "SELECT agency_id FROM agency_profiles WHERE user_id = ?",
                [req.user.user_id],
                (err, agencyResult) => {

                    if (err)
                        return res.status(500).json(err);

                    if (
                        result[0].agency_id !==
                        agencyResult[0].agency_id
                    ) {

                        return res.status(403).json({
                            message: "Access denied."
                        });

                    }

                    agencyTechnicianModel.deleteTechnician(
                        req.params.id,
                        (err) => {

                            if (err)
                                return res.status(500).json(err);

                            res.json({
                                message: "Technician deleted successfully."
                            });

                        }
                    );

                }
            );

        }
    );

};

module.exports = {

    createTechnician,
    getAgencyTechnicians,
    getTechnicianById,
    updateTechnician,
    deleteTechnician

};