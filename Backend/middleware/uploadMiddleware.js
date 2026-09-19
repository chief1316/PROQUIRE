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