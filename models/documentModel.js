const db = require("../config/db");

const uploadDocument = (documentData, callback) => {

    const sql = `
        INSERT INTO documents
        (
            technician_id,
            agency_id,
            document_type,
            document_path,
            verification_status
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            documentData.technician_id,
            documentData.agency_id,
            documentData.document_type,
            documentData.document_path,
            "Pending"
        ],
        callback
    );
};

const getDocumentsByAgency = (agencyId, callback) => {

    db.query(
        "SELECT * FROM documents WHERE agency_id = ?",
        [agencyId],
        callback
    );

};

const getDocumentsByTechnician = (technicianId, callback) => {

    db.query(
        "SELECT * FROM documents WHERE technician_id = ?",
        [technicianId],
        callback
    );

};

const getDocumentById = (documentId, callback) => {

    db.query(
        "SELECT * FROM documents WHERE document_id = ?",
        [documentId],
        callback
    );

};

module.exports = {
    uploadDocument,
    getDocumentsByAgency,
    getDocumentsByTechnician,
    getDocumentById
};