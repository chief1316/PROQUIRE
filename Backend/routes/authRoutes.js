const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

const {
    register,
    login
} = authController;

const upload = require("../middleware/uploadMiddleware");

const authMiddleware = require("../middleware/authMiddleware");

router.post(
    "/register",
    upload.single("profile_photo"),
    register
);

router.post("/login", login);

router.put(
    "/change-password",
    authMiddleware,
    authController.changePassword
);

module.exports = router;