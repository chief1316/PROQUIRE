const db = require("../config/db");


/* =========================================================
   GET TECHNICIAN ID FROM USER ID
========================================================= */

exports.getTechnicianIdByUser = (
    userId
) => {

    return new Promise(
        (resolve, reject) => {

            const sql = `
                SELECT
                    technician_id
                FROM technician_profiles
                WHERE user_id = ?
                LIMIT 1
            `;

            db.query(
                sql,
                [userId],
                (err, results) => {

                    if (err) {
                        reject(err);
                    }

                    else {
                        resolve(
                            results[0] || null
                        );
                    }

                }
            );

        }
    );

};


/* =========================================================
   CREATE PORTFOLIO ITEM
========================================================= */

exports.createPortfolio = (
    technician_id,
    title,
    image_path,
    project_description
) => {

    return new Promise(
        (resolve, reject) => {

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
                    }

                    else {
                        resolve(result);
                    }

                }
            );

        }
    );

};


/* =========================================================
   GET PORTFOLIO BY TECHNICIAN
========================================================= */

exports.getPortfolioByTechnician = (
    technicianId
) => {

    return new Promise(
        (resolve, reject) => {

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
                    }

                    else {
                        resolve(results);
                    }

                }
            );

        }
    );

};


/* =========================================================
   DELETE PORTFOLIO ITEM
   Only the technician who owns the item can delete it.
========================================================= */

exports.deletePortfolio = (
    portfolioId,
    userId
) => {

    return new Promise(
        (resolve, reject) => {

            /*
             * First find the portfolio item and verify
             * that it belongs to the authenticated user.
             */

            const findSql = `
                SELECT
                    p.image_path
                FROM technician_portfolio p
                INNER JOIN technician_profiles tp
                    ON p.technician_id =
                       tp.technician_id
                WHERE
                    p.portfolio_id = ?
                    AND tp.user_id = ?
                LIMIT 1
            `;

            db.query(
                findSql,
                [
                    portfolioId,
                    userId
                ],
                (err, results) => {

                    if (err) {
                        reject(err);
                        return;
                    }


                    /*
                     * Portfolio item does not belong
                     * to this user.
                     */

                    if (
                        !results ||
                        results.length === 0
                    ) {

                        resolve(null);
                        return;

                    }


                    const imagePath =
                        results[0].image_path;


                    /*
                     * Delete only the portfolio record
                     * belonging to this authenticated user.
                     */

                    const deleteSql = `
                        DELETE p
                        FROM technician_portfolio p
                        INNER JOIN technician_profiles tp
                            ON p.technician_id =
                               tp.technician_id
                        WHERE
                            p.portfolio_id = ?
                            AND tp.user_id = ?
                    `;

                    db.query(
                        deleteSql,
                        [
                            portfolioId,
                            userId
                        ],
                        (deleteErr, result) => {

                            if (deleteErr) {
                                reject(deleteErr);
                                return;
                            }


                            resolve({
                                imagePath,
                                affectedRows:
                                    result.affectedRows
                            });

                        }
                    );

                }
            );

        }
    );

};