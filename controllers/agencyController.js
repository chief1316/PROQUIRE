const agencyModel = require("../models/agencyModel");

/*
|--------------------------------------------------------------------------
| Create Agency Profile
|--------------------------------------------------------------------------
*/

const createAgency = (req, res) => {

    // Only agencies can create agency profiles
    if (req.user.role !== "agency") {
        return res.status(403).json({
            message: "Only agency accounts can create agency profiles."
        });
    }

    // Check if the logged-in user already has an agency profile
    agencyModel.getAgencyByUserId(req.user.user_id, (err, agencies) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (agencies.length > 0) {
            return res.status(400).json({
                message: "Agency profile already exists."
            });
        }

        const agencyData = {

            user_id: req.user.user_id,
            company_name: req.body.company_name,
            registration_number: req.body.registration_number,
            kra_pin: req.body.kra_pin,
            email: req.body.email,
            phone: req.body.phone,
            county: req.body.county,
            address: req.body.address,
            description: req.body.description,
            logo: req.file ? req.file.path : null

        };

        agencyModel.createAgency(agencyData, (err, result) => {

            if (err) {
                return res.status(500).json({
                    message: "Failed to create agency profile.",
                    error: err
                });
            }

            res.status(201).json({
                message: "Agency profile created successfully.",
                agency_id: result.insertId
            });

        });

    });

};


/*
|--------------------------------------------------------------------------
| Get Agency By ID
|--------------------------------------------------------------------------
*/

const getAgencyById = (req, res) => {

    agencyModel.getAgencyById(req.params.id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Agency not found."
            });
        }

        res.json(result[0]);

    });

};


/*
|--------------------------------------------------------------------------
| Get Logged-in Agency
|--------------------------------------------------------------------------
*/

const getMyAgency = (req, res) => {

    agencyModel.getAgencyByUserId(req.user.user_id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Agency profile not found."
            });
        }

        res.json(result[0]);

    });

};


/*
|--------------------------------------------------------------------------
| Update Agency
|--------------------------------------------------------------------------
*/

const updateAgency = (req, res) => {

    // Verify ownership
    agencyModel.getAgencyById(req.params.id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Agency not found."
            });
        }

        if (result[0].user_id !== req.user.user_id) {
            return res.status(403).json({
                message: "You are not allowed to update this agency."
            });
        }

        const agencyData = {

            company_name: req.body.company_name,
            registration_number: req.body.registration_number,
            kra_pin: req.body.kra_pin,
            email: req.body.email,
            phone: req.body.phone,
            county: req.body.county,
            address: req.body.address,
            description: req.body.description,
            logo: req.file ? req.file.path : result[0].logo

        };

        agencyModel.updateAgency(req.params.id, agencyData, (err) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "Agency updated successfully."
            });

        });

    });

};


/*
|--------------------------------------------------------------------------
| Delete Agency
|--------------------------------------------------------------------------
*/

const deleteAgency = (req, res) => {

    agencyModel.getAgencyById(req.params.id, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Agency not found."
            });
        }

        if (result[0].user_id !== req.user.user_id) {
            return res.status(403).json({
                message: "You are not allowed to delete this agency."
            });
        }

        agencyModel.deleteAgency(req.params.id, (err) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "Agency deleted successfully."
            });

        });

    });

};


module.exports = {

    createAgency,
    getAgencyById,
    getMyAgency,
    updateAgency,
    deleteAgency

};