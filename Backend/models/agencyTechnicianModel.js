const db = require("../config/db");

/*
|--------------------------------------------------------------------------
| Create Technician
|--------------------------------------------------------------------------
*/

const createTechnician = (technicianData, callback) => {

    const userSql = `
        INSERT INTO users
        (
            full_name,
            email,
            phone,
            password,
            role
        )
        VALUES (?, ?, ?, ?, 'technician')
    `;

    db.query(
        userSql,
        [
            technicianData.full_name,
            technicianData.email,
            technicianData.phone,
            technicianData.password
        ],
        (err, userResult) => {

            if (err) return callback(err);

            const technicianSql = `
                INSERT INTO technician_profiles
                (
                    user_id,
                    category_id,
                    location,
                    years_experience,
                    bio,
                    agency_id,
                    employment_type,
                    is_verified
                )
                VALUES (?, ?, ?, ?, ?, ?, 'Agency', 0)
            `;

            db.query(
                technicianSql,
                [
                    userResult.insertId,
                    technicianData.category_id,
                    technicianData.location,
                    technicianData.years_experience,
                    technicianData.bio,
                    technicianData.agency_id
                ],
                callback
            );

        }
    );

};

/*
|--------------------------------------------------------------------------
| Get All Agency Technicians
|--------------------------------------------------------------------------
*/

const getAgencyTechnicians = (agencyId, callback) => {

    const sql = `
        SELECT
            tp.technician_id,
            u.full_name,
            u.email,
            u.phone,
            tp.category_id,
            c.category_name,
            tp.location,
            tp.years_experience,
            tp.bio,
            tp.is_verified
        FROM technician_profiles tp
        JOIN users u
            ON tp.user_id = u.user_id
        LEFT JOIN categories c
            ON tp.category_id = c.category_id
        WHERE tp.agency_id = ?
    `;

    db.query(sql, [agencyId], callback);

};

/*
|--------------------------------------------------------------------------
| Get One Technician
|--------------------------------------------------------------------------
*/

const getTechnicianById = (technicianId, callback) => {

    const sql = `
        SELECT
            tp.*,
            u.full_name,
            u.email,
            u.phone,
            c.category_name
        FROM technician_profiles tp
        JOIN users u
            ON tp.user_id = u.user_id
        LEFT JOIN categories c
            ON tp.category_id = c.category_id
        WHERE tp.technician_id = ?
    `;

    db.query(sql, [technicianId], callback);

};

/*
|--------------------------------------------------------------------------
| Update Technician
|--------------------------------------------------------------------------
*/

const updateTechnician = (technicianId, data, callback) => {

    const sql = `
        UPDATE technician_profiles
        SET
            category_id = ?,
            location = ?,
            years_experience = ?,
            bio = ?
        WHERE technician_id = ?
    `;

    db.query(
        sql,
        [
            data.category_id,
            data.location,
            data.years_experience,
            data.bio,
            technicianId
        ],
        callback
    );

};

/*
|--------------------------------------------------------------------------
| Delete Technician
|--------------------------------------------------------------------------
*/

const deleteTechnician = (technicianId, callback) => {

    /*
    |--------------------------------------------------------------------------
    | Start transaction
    |--------------------------------------------------------------------------
    */

    db.beginTransaction((transactionError) => {

        if (transactionError) {
            return callback(transactionError);
        }

        /*
        |--------------------------------------------------------------------------
        | Find the user account belonging to the technician
        |--------------------------------------------------------------------------
        */

        const findUserSql = `
            SELECT user_id
            FROM technician_profiles
            WHERE technician_id = ?
        `;

        db.query(
            findUserSql,
            [technicianId],
            (findError, results) => {

                if (findError) {
                    return db.rollback(() => {
                        callback(findError);
                    });
                }

                if (results.length === 0) {
                    return db.rollback(() => {
                        callback({
                            code: "TECHNICIAN_NOT_FOUND",
                            message: "Technician not found."
                        });
                    });
                }

                const userId = results[0].user_id;

                /*
                |--------------------------------------------------------------------------
                | Delete technician profile
                |--------------------------------------------------------------------------
                */

                const deleteProfileSql = `
                    DELETE FROM technician_profiles
                    WHERE technician_id = ?
                `;

                db.query(
                    deleteProfileSql,
                    [technicianId],
                    (profileError) => {

                        if (profileError) {
                            return db.rollback(() => {
                                callback(profileError);
                            });
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | Delete associated user account
                        |--------------------------------------------------------------------------
                        */

                        const deleteUserSql = `
                            DELETE FROM users
                            WHERE user_id = ?
                        `;

                        db.query(
                            deleteUserSql,
                            [userId],
                            (userError) => {

                                if (userError) {
                                    return db.rollback(() => {
                                        callback(userError);
                                    });
                                }

                                /*
                                |--------------------------------------------------------------------------
                                | Commit transaction
                                |--------------------------------------------------------------------------
                                */

                                db.commit((commitError) => {

                                    if (commitError) {
                                        return db.rollback(() => {
                                            callback(commitError);
                                        });
                                    }

                                    callback(null, {
                                        message: "Technician and user account deleted successfully."
                                    });

                                });

                            }
                        );

                    }
                );

            }
        );

    });

};

/*
|--------------------------------------------------------------------------
| Export Functions
|--------------------------------------------------------------------------
*/

module.exports = {

    createTechnician,
    getAgencyTechnicians,
    getTechnicianById,
    updateTechnician,
    deleteTechnician

};