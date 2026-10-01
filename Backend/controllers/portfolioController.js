const fs = require("fs");
const path = require("path");

const portfolioModel =
    require("../models/portfolioModel");


/* =========================================================
   CREATE PORTFOLIO ITEM
========================================================= */

exports.createPortfolio = async (
    req,
    res
) => {

    try {

        /*
         * Portfolio creation is for technicians only.
         */

        if (
            req.user.role !== "technician"
        ) {

            return res.status(403).json({
                message:
                    "Only technician accounts can manage portfolios."
            });

        }


        /*
         * Get the authenticated user's ID.
         */

        const userId =
            req.user.user_id;


        /*
         * IMPORTANT:
         *
         * user_id and technician_id are different IDs.
         *
         * Find the real technician_id belonging
         * to this authenticated user.
         */

        const technician =
            await portfolioModel
                .getTechnicianIdByUser(
                    userId
                );


        if (!technician) {

            return res.status(404).json({
                message:
                    "Technician profile not found."
            });

        }


        const technician_id =
            technician.technician_id;


        const {
            title,
            project_description
        } = req.body;


        if (!title || !title.trim()) {

            return res.status(400).json({
                message:
                    "Portfolio title is required."
            });

        }


        const image_path =
            req.file
                ? `/uploads/${req.file.filename}`
                : null;


        const result =
            await portfolioModel
                .createPortfolio(
                    technician_id,
                    title.trim(),
                    image_path,
                    project_description
                        ? project_description.trim()
                        : null
                );


        return res.status(201).json({

            message:
                "Portfolio item created",

            portfolioId:
                result.insertId

        });

    }

    catch (error) {

        console.log(
            "Portfolio creation error:",
            error
        );

        return res.status(500).json({

            message:
                "Error creating portfolio",

            error

        });

    }

};


/* =========================================================
   GET PORTFOLIO BY TECHNICIAN
========================================================= */

exports.getPortfolioByTechnician =
async (
    req,
    res
) => {

    try {

        const technicianId =
            req.params.technicianId;


        const result =
            await portfolioModel
                .getPortfolioByTechnician(
                    technicianId
                );


        return res.status(200).json(
            result
        );

    }

    catch (error) {

        console.log(
            "Portfolio fetch error:",
            error
        );

        return res.status(500).json({

            message:
                "Error fetching portfolio",

            error

        });

    }

};


/* =========================================================
   DELETE PORTFOLIO ITEM
========================================================= */

exports.deletePortfolio =
async (
    req,
    res
) => {

    try {

        /*
         * Only technicians can delete portfolio items.
         */

        if (
            req.user.role !== "technician"
        ) {

            return res.status(403).json({

                message:
                    "Only technician accounts can manage portfolios."

            });

        }


        const portfolioId =
            Number(
                req.params.portfolioId
            );


        /*
         * Validate portfolio ID.
         */

        if (
            !Number.isInteger(
                portfolioId
            ) ||
            portfolioId <= 0
        ) {

            return res.status(400).json({

                message:
                    "Invalid portfolio ID."

            });

        }


        /*
         * The model verifies ownership using:
         *
         * portfolio_id
         * +
         * authenticated user_id
         */

        const result =
            await portfolioModel
                .deletePortfolio(
                    portfolioId,
                    req.user.user_id
                );


        /*
         * Item either does not exist or does not
         * belong to the authenticated technician.
         */

        if (!result) {

            return res.status(404).json({

                message:
                    "Portfolio item not found or you do not have permission to delete it."

            });

        }


        /*
         * Remove the uploaded image from the server.
         */

        if (
            result.imagePath
        ) {

            const filename =
                path.basename(
                    result.imagePath
                );


            const imageFilePath =
                path.join(
                    __dirname,
                    "..",
                    "uploads",
                    filename
                );


            fs.unlink(
                imageFilePath,
                (err) => {

                    if (
                        err &&
                        err.code !== "ENOENT"
                    ) {

                        console.error(
                            "Error deleting portfolio image:",
                            err
                        );

                    }

                }
            );

        }


        return res.status(200).json({

            message:
                "Portfolio item deleted successfully."

        });

    }

    catch (error) {

        console.log(
            "Portfolio deletion error:",
            error
        );

        return res.status(500).json({

            message:
                "Error deleting portfolio item",

            error

        });

    }

};