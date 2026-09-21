const express = require("express");
const router = express.Router();
const db = require("../config/db");

// Get all service categories
router.get("/", (req, res) => {
    const sql = `
        SELECT
            category_id,
            category_name
        FROM categories
        ORDER BY category_name ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching categories:", err);

            return res.status(500).json({
                message: "Failed to fetch categories",
                error: err
            });
        }

        res.status(200).json(results);
    });
});

module.exports = router;