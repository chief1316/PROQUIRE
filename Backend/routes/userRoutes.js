const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const userController = require("../controllers/userController");
const upload = require("../middleware/uploadMiddleware");

router.get(
    "/me",
    authMiddleware,
    userController.getCurrentUser
);

router.put(
    "/me",
    authMiddleware,
    upload.single("profile_photo"),
    userController.updateCurrentUser
);

router.post(
    "/forgot-password",
    userController.forgotPassword
);

router.post(
    "/reset-password",
    userController.resetPassword
);

router.put(
    "/change-password",
    authMiddleware,
    userController.changePassword
);

router.delete(
    "/me",
    authMiddleware,
    userController.deleteCurrentUser
);

module.exports = router;