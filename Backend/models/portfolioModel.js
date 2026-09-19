const db = require("../config/db");

exports.createPortfolio = (
    technician_id,
    title,
    image_path,
    project_description
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            INSERT INTO technician_portfolio
            (
                technician_id,
                title,
                image_path,
                project_description
            )
            VALUES (?, ?, ?, ?)
        `;

        db.query(

            sql,

            [
                technician_id,
                title,
                image_path,
                project_description
            ],

            (err, result) => {

                if (err) {

                    reject(err);

                } else {

                    resolve(result);

                }

            }

        );

    });

};


exports.getPortfolioByTechnician = (
    technicianId
) => {

    return new Promise((resolve, reject) => {

        const sql = `
            SELECT
                portfolio_id,
                title,
                image_path,
                project_description,
                uploaded_at
            FROM technician_portfolio
            WHERE technician_id = ?
            ORDER BY uploaded_at DESC
        `;

        db.query(

            sql,

            [technicianId],

            (err, results) => {

                if (err) {

                    reject(err);

                } else {

                    resolve(results);

                }

            }

        );

    });

};