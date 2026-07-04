const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/");

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

        // Microsoft Word (.doc)
        "application/msword",

        // Microsoft Word (.docx)
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

        fileSize: 10 * 1024 * 1024 // 10 MB

    }

});


module.exports = upload;