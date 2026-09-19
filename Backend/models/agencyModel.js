const db = require("../config/db");

/*
|--------------------------------------------------------------------------
| Create Agency Profile
|--------------------------------------------------------------------------
*/

const createAgency = (agencyData, callback) => {

    const sql = `
        INSERT INTO agency_profiles
        (
            user_id,
            company_name,
            registration_number,
            kra_pin,
            email,
            phone,
            county,
            address,
            description,
            logo
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            agencyData.user_id,
            agencyData.company_name,
            agencyData.registration_number,
            agencyData.kra_pin,
            agencyData.email,
            agencyData.phone,
            agencyData.county,
            agencyData.address,
            agencyData.description,
            agencyData.logo
        ],
        callback
    );

};


/*
|--------------------------------------------------------------------------
| Get Agency By Agency ID
|--------------------------------------------------------------------------
*/

const getAgencyById = (agencyId, callback) => {

    db.query(
        `
        SELECT *
        FROM agency_profiles
        WHERE agency_id = ?
        `,
        [agencyId],
        callback
    );

};


/*
|--------------------------------------------------------------------------
| Get Agency By User ID
|--------------------------------------------------------------------------
*/

const getAgencyByUserId = (userId, callback) => {

    db.query(
        `
        SELECT *
        FROM agency_profiles
        WHERE user_id = ?
        `,
        [userId],
        callback
    );

};


/*
|--------------------------------------------------------------------------
| Update Agency
|--------------------------------------------------------------------------
*/

const updateAgency = (agencyId, agencyData, callback) => {

    const sql = `
        UPDATE agency_profiles
        SET
            company_name = ?,
            registration_number = ?,
            kra_pin = ?,
            email = ?,
            phone = ?,
            county = ?,
            address = ?,
            description = ?,
            logo = ?
        WHERE agency_id = ?
    `;

    db.query(
        sql,
        [
            agencyData.company_name,
            agencyData.registration_number,
            agencyData.kra_pin,
            agencyData.email,
            agencyData.phone,
            agencyData.county,
            agencyData.address,
            agencyData.description,
            agencyData.logo,
            agencyId
        ],
        callback
    );

};


/*
|--------------------------------------------------------------------------
| Delete Agency
|--------------------------------------------------------------------------
*/

const deleteAgency = (agencyId, callback) => {

    db.query(
        `
        DELETE
        FROM agency_profiles
        WHERE agency_id = ?
        `,
        [agencyId],
        callback
    );

};


/*
|--------------------------------------------------------------------------
| Exports
|--------------------------------------------------------------------------
*/

module.exports = {

    createAgency,
    getAgencyById,
    getAgencyByUserId,
    updateAgency,
    deleteAgency

};