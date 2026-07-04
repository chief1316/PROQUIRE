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
            tp.location,
            tp.years_experience,
            tp.bio,
            tp.is_verified
        FROM technician_profiles tp
        JOIN users u
            ON tp.user_id = u.user_id
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
            u.phone
        FROM technician_profiles tp
        JOIN users u
            ON tp.user_id = u.user_id
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

    db.query(
        "DELETE FROM technician_profiles WHERE technician_id = ?",
        [technicianId],
        callback
    );

};

module.exports = {

    createTechnician,
    getAgencyTechnicians,
    getTechnicianById,
    updateTechnician,
    deleteTechnician

};