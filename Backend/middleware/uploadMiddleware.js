const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        let folder = "uploads/";

        if (file.fieldname === "logo") {
            folder = "uploads/agency_logos/";
        }

        else if (file.fieldname === "profile_photo") {
            folder = "uploads/profile_photos/";
        }

        else if (file.fieldname === "portfolio_image") {
            folder = "uploads/portfolios/";
        }

        else if (file.fieldname === "document") {
            folder = "uploads/documents/";
        }
        else if (file.fieldname === "selfie") {
    folder = "uploads/verification_selfies/";
}

        // Create folder automatically if it doesn't exist
        fs.mkdirSync(folder, { recursive: true });

        cb(null, folder);

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);

    }

});


const fileFilter = (req, file, cb) => {

    /*
     * Verification documents must be PDF only.
     */
    if (file.fieldname === "document") {

        const extension =
            path.extname(file.originalname).toLowerCase();

        if (
            file.mimetype === "application/pdf" &&
            extension === ".pdf"
        ) {

            return cb(null, true);

        }

        return cb(
            new Error(
                "Verification documents must be uploaded as PDF files only."
            )
        );

    }
    /*
 * Identity verification selfies must be images only.
 */
if (file.fieldname === "selfie") {
    const allowedSelfieTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (allowedSelfieTypes.includes(file.mimetype)) {
        return cb(null, true);
    }

    return cb(
        new Error(
            "Selfie must be a JPG, PNG or WEBP image."
        )
    );
}


    /*
     * Other uploads can continue using their existing
     * allowed formats.
     */
    const allowedMimeTypes = [

        // Images
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",

        // PDF
        "application/pdf",

        // Word
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

    ];


    if (allowedMimeTypes.includes(file.mimetype)) {

        cb(null, true);

    } else {

        cb(
            new Error(
                "Only JPG, JPEG, PNG, WEBP, PDF, DOC and DOCX files are allowed."
            )
        );

    }

};


const upload = multer({

    storage,

    fileFilter,

    limits: {

        fileSize: 10 * 1024 * 1024

    }

});


module.exports = upload;