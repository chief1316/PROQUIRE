const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const db = require("../config/db");

const technicianController = require("../controllers/technicianController");

const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");

const {
    verifyTechnician
} = require("../controllers/technicianController");

//test admin route
router.get("/dashboard", verifyToken, verifyAdmin, (req, res) => {
    res.json({
        message: "Welcome Admin"
    });
});

//get all users (admin only)
router.get("/users", verifyToken, verifyAdmin, (req, res) => {

    const sql = `
    SELECT
        user_id,
        full_name,
        email,
        phone,
        role,
        created_at,
        is_active
    FROM users
`;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(results);
    });

});

//get technicians pending approval

router.get(
    "/pending-technicians",
    verifyToken,
    verifyAdmin,
    technicianController.getPendingTechnicians
);

// Securely view technician verification documents and selfies
router.get(
    "/verification-documents/:documentId/:fileType",
    verifyToken,
    verifyAdmin,
    (req, res) => {
        const documentId = Number(req.params.documentId);
        const fileType = req.params.fileType;

        if (!Number.isInteger(documentId) || documentId < 1) {
            return res.status(400).json({
                message: "Invalid document ID."
            });
        }

        if (!["document", "selfie"].includes(fileType)) {
            return res.status(400).json({
                message: "Invalid file type."
            });
        }

        const sql = `
            SELECT document_path, selfie_path
            FROM verification_documents
            WHERE document_id = ?
        `;

        db.query(sql, [documentId], (err, results) => {
            if (err) {
                console.error("Error retrieving verification file:", err);
                return res.status(500).json({
                    message: "Unable to retrieve verification file."
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Verification document not found."
                });
            }

            const relativePath = fileType === "document"
                ? results[0].document_path
                : results[0].selfie_path;

            if (!relativePath) {
                return res.status(404).json({
                    message: "This verification file is not available."
                });
            }

            const uploadsRoot = path.resolve(
                __dirname,
                "..",
                "uploads"
            );

            const filePath = path.resolve(
                __dirname,
                "..",
                relativePath
            );

            const relativeCheck = path.relative(
                uploadsRoot,
                filePath
            );

            if (
                relativeCheck.startsWith("..") ||
                path.isAbsolute(relativeCheck)
            ) {
                return res.status(403).json({
                    message: "Access to this file is not allowed."
                });
            }

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    message: "Verification file not found on the server."
                });
            }

            res.sendFile(filePath);
        });
    }
);

// verify technician (admin only)
router.patch(
    "/verify-technician/:id",
    verifyToken,
    verifyAdmin,
    technicianController.verifyTechnician
);

 // Activate or deactivate a user (admin only)
router.patch(
    "/users/:id/status",
    verifyToken,
    verifyAdmin,
    (req, res) => {
        const userId = Number(req.params.id);
        const { is_active } = req.body;

        if (!Number.isInteger(userId) || userId < 1) {
            return res.status(400).json({
                message: "Invalid user ID."
            });
        }

        if (is_active !== 0 && is_active !== 1) {
            return res.status(400).json({
                message: "is_active must be 0 or 1."
            });
        }

        db.query(
            "UPDATE users SET is_active = ? WHERE user_id = ?",
            [is_active, userId],
            (err, result) => {
                if (err) {
                    console.error("Error updating account status:", err);
                    return res.status(500).json({
                        message: "Unable to update account status."
                    });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message: "User not found."
                    });
                }

                return res.json({
                    message: is_active === 1
                        ? "User account activated successfully."
                        : "User account deactivated successfully.",
                    user_id: userId,
                    is_active
                });
            }
        );
    }
);




module.exports = router;