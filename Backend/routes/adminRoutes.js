const express = require("express");
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