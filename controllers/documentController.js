const documentModel = require("../models/documentModel");
const db = require("../config/db");

/*
|--------------------------------------------------------------------------
| Upload Document
|--------------------------------------------------------------------------
*/

const uploadDocument = (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            message: "Please upload a document."
        });
    }

    const userId = req.user.user_id;
    const role = req.user.role;

    const documentData = {

        technician_id: null,
        agency_id: null,
        document_type: req.body.document_type,
        document_path: `/uploads/${req.file.filename}`

    };

    // Logged in as Technician
    if (role === "technician") {

        db.query(
            "SELECT technician_id FROM technician_profiles WHERE user_id = ?",
            [userId],
            (err, result) => {

                if (err)
                    return res.status(500).json(err);

                if (result.length === 0) {
                    return res.status(404).json({
                        message: "Technician profile not found."
                    });
                }

                documentData.technician_id = result[0].technician_id;

                documentModel.uploadDocument(
                    documentData,
                    (err, uploadResult) => {

                        if (err)
                            return res.status(500).json(err);

                        res.status(201).json({
                            message: "Document uploaded successfully.",
                            document_id: uploadResult.insertId
                        });

                    }
                );

            }
        );

    }

    // Logged in as Agency
    else if (role === "agency") {

        db.query(
            "SELECT agency_id FROM agency_profiles WHERE user_id = ?",
            [userId],
            (err, result) => {

                if (err)
                    return res.status(500).json(err);

                if (result.length === 0) {
                    return res.status(404).json({
                        message: "Agency profile not found."
                    });
                }

                documentData.agency_id = result[0].agency_id;

                documentModel.uploadDocument(
                    documentData,
                    (err, uploadResult) => {

                        if (err)
                            return res.status(500).json(err);

                        res.status(201).json({
                            message: "Document uploaded successfully.",
                            document_id: uploadResult.insertId
                        });

                    }
                );

            }
        );

    }

    else {

        return res.status(403).json({
            message: "Only technicians and agencies can upload documents."
        });

    }

};


/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {

    uploadDocument

};