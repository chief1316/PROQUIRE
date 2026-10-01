const express =
    require("express");

const router =
    express.Router();


const portfolioController =
    require("../controllers/portfolioController");


const verifyToken =
    require("../middleware/authMiddleware");


const upload =
    require("../middleware/uploadMiddleware");


/* =========================================================
   CREATE PORTFOLIO
========================================================= */

router.post(
    "/",
    verifyToken,
    upload.single("image"),
    portfolioController.createPortfolio
);


/* =========================================================
   DELETE PORTFOLIO
========================================================= */

router.delete(
    "/:portfolioId",
    verifyToken,
    portfolioController.deletePortfolio
);


/* =========================================================
   GET PORTFOLIO
========================================================= */

router.get(
    "/:technicianId",
    portfolioController.getPortfolioByTechnician
);


module.exports = router;