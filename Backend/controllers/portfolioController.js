const portfolioModel =
require("../models/portfolioModel");


exports.createPortfolio = async (
    req,
    res
) => {

    try {

        const technician_id =
            req.user.user_id;

        const {
            title,
            project_description
        } = req.body;

        const image_path =
            req.file
            ? `/uploads/${req.file.filename}`
            : null;

        const result =
            await portfolioModel.createPortfolio(

                technician_id,

                title,

                image_path,

                project_description

            );

        res.status(201).json({

            message:
            "Portfolio item created",

            portfolioId:
            result.insertId

        });

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message:
            "Error creating portfolio",

            error

        });

    }

};



exports.getPortfolioByTechnician =
async (req, res) => {

    try {

        const technicianId =
            req.params.technicianId;

        const result =

            await
            portfolioModel
            .getPortfolioByTechnician(
                technicianId
            );

        res.status(200).json(
            result
        );

    }

    catch (error) {

        console.log(error);

        res.status(500).json({

            message:
            "Error fetching portfolio",

            error

        });

    }

};