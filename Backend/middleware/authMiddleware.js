const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:");
    console.log(authHeader);

    if (!authHeader) {
        return res.status(401).json({
            message: "Access denied. No token provided."
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("DECODED JWT:");
        console.log(decoded);

        req.user = decoded;

        next();

    } catch (error) {

        console.log(error);

        return res.status(403).json({
            message: "Invalid token."
        });

    }

};

module.exports = verifyToken;