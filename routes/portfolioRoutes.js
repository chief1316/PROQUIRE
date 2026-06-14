const express = require("express");

const router =
express.Router();

const portfolioController =
require("../controllers/portfolioController");

const verifyToken =
require("../middleware/authMiddleware");

const upload =
require("../middleware/uploadMiddleware");


router.post(

    "/",

    verifyToken,
    upload.single("image"),
    
    portfolioController.createPortfolio

);


router.get(

    "/:technicianId",

    portfolioController
    .getPortfolioByTechnician

);


module.exports = router;