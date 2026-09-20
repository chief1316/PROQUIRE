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
| Get All Agencies
|--------------------------------------------------------------------------
|
| Used when technicians need to select an agency.
|
| Only public/basic agency information is returned.
| Sensitive information such as KRA PIN and registration number
| is not exposed.
|
|--------------------------------------------------------------------------
*/

const getAllAgencies = (callback) => {

    db.query(
        `
        SELECT
            agency_id,
            company_name,
            county,
            address,
            description,
            logo,
            is_verified
        FROM agency_profiles
        ORDER BY company_name ASC
        `,
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
    getAllAgencies,
    getAgencyById,
    getAgencyByUserId,
    updateAgency,
    deleteAgency

};