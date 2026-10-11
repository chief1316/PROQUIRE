const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const notificationController = require("../controllers/notificationController");


/*
 * ==========================================
 * GET TECHNICIAN NOTIFICATIONS
 * ==========================================
 */

router.get(
    "/",
    verifyToken,
    notificationController.getTechnicianNotifications
);

/*
 * ==========================================
 * GET AGENCY NOTIFICATIONS
 * ==========================================
 */

router.get(
    "/agency",
    verifyToken,
    notificationController.getAgencyNotifications
);


router.patch(
    "/agency/read-all",
    verifyToken,
    notificationController.markAllAgencyNotificationsAsRead
);

router.patch(
    "/agency/:notificationId/read",
    verifyToken,
    notificationController.markAgencyNotificationAsRead
);



/*
 * ==========================================
 * MARK ONE NOTIFICATION AS READ
 * ==========================================
 */

router.patch(
    "/:notificationId/read",
    verifyToken,
    notificationController.markNotificationAsRead
);


/*
 * ==========================================
 * MARK ALL TECHNICIAN NOTIFICATIONS AS READ
 * ==========================================
 */

router.patch(
    "/read-all",
    verifyToken,
    notificationController.markAllNotificationsAsRead
);


module.exports = router;