const express = require("express");
const router = express.Router();

const {
    register,
    login
} = require("../controllers/authController");

const upload = require("../middleware/uploadMiddleware");

router.post(
    "/register",
    upload.single("profile_photo"),
    register
);

router.post("/login", login);

module.exports = router;