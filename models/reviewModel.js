const db = require("../config/db");

exports.createReview = (client_id, technician_id, rating, comment) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO reviews
            (
                client_id,
                technician_id,
                rating,
                comment
            )
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [client_id, technician_id, rating, comment],
            (err, result) => {
                if (err) reject(err);
                else resolve(result);
            }
        );
    });
};

exports.getAverageRating = (technicianId) => {
    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                technician_id,
                ROUND(AVG(rating),1) AS average_rating,
                COUNT(*) AS total_reviews
            FROM reviews
            WHERE technician_id = ?
            GROUP BY technician_id
        `;

        db.query(sql, [technicianId], (err, results) => {

            if (err) {
                reject(err);
            } else {

                if (results.length === 0) {

                    resolve({
                        technician_id: technicianId,
                        average_rating: 0,
                        total_reviews: 0
                    });

                } else {

                    resolve(results[0]);

                }

            }

        });

    });
};