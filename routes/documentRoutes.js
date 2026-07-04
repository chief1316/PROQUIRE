const express = require("express");
const router = express.Router();

const documentController = require("../controllers/documentController");

const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

/*
|--------------------------------------------------------------------------
| Upload verification document
|--------------------------------------------------------------------------
|
| Technicians and agencies upload their verification documents.
|
*/

router.post(
    "/upload",
    verifyToken,
    upload.single("document"),
    documentController.uploadDocument
);

module.exports = router;