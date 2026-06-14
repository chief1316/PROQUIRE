const verifyClient = (req, res, next) => {

    if (req.user.role !== "client") {

        return res.status(403).json({

            message: "Access denied. Clients only."

        });

    }

    next();

};

module.exports = verifyClient;