const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

exports.register = async (req, res) => {
    try {
        const { full_name, email, phone, password, role } = req.body;

        const profile_photo =
          req.file
            ? `profile_photos/${req.file.filename}`
            : null;

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
INSERT INTO users
(full_name, email, phone, profile_photo, password, role)
VALUES (?, ?, ?, ?, ?, ?)
`;

        db.query(
            sql,
            [full_name, email, phone, profile_photo, hashedPassword, role || "client"],
            (err, result) => {
                if (err) {
                    return res.status(500).json(err);
                }

                res.status(201).json({
                    message: "User registered successfully"
                });
            }
        );
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.login = (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {
                return res.status(401).json({
                    message: "Invalid credentials"
                });
            }

            const user = results[0];

            const match = await bcrypt.compare(
                password,
                user.password
            );

            if (!match) {
                return res.status(401).json({
                    message: "Invalid credentials"
                });
            }

            const token = jwt.sign(
                {
                    user_id: user.user_id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            res.json({
    message: "Login successful",
    token,
    user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profile_photo: user.profile_photo
            ? `http://localhost:5000/uploads/profile_photos/${user.profile_photo}`
            : null
    }
});
        }
    );
};