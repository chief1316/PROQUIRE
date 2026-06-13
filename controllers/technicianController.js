const db = require("../config/db");

exports.addTechnicianProfile = (req, res) => {

    const {
        user_id,
        category_id,
        bio,
        years_experience,
        location
    } = req.body;

    const sql = `
        INSERT INTO technician_profiles
        (user_id, category_id, bio, years_experience, location)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            user_id,
            category_id,
            bio,
            years_experience,
            location
        ],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Error creating technician profile",
                    error: err
                });

            }

            res.status(201).json({
                message: "Technician profile created successfully",
                technician_id: result.insertId
            });

        }
    );

};

//adding controller
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
                    message: "Technician verified but document status update failed",
                    error: err2
                });

            }

            res.status(200).json({
                message: "Technician and documents verified successfully"
            });

        });

    });

};

exports.uploadVerificationDocument = (req, res) => {

    const {
        technician_id,
        document_type,
        document_path
    } = req.body;

    const sql = `
        INSERT INTO verification_documents
        (technician_id, document_type, document_path)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [
            technician_id,
            document_type,
            document_path
        ],
        (err, result) => {

            if (err) {

                return res.status(500).json({
                    message: "Error uploading document",
                    error: err
                });

            }

            res.status(201).json({

                message: "Document uploaded successfully",

                document: {

                    document_id: result.insertId,
                    technician_id,
                    document_type,
                    document_path

                }

            });

        }

    );

};

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