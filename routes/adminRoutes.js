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
            created_at
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



module.exports = router;