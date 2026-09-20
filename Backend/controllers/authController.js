const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");


// ==========================================
// REGISTER USER
// ==========================================
exports.register = async (req, res) => {
    try {

        const {
            full_name,
            email,
            phone,
            password,
            role
        } = req.body;


        // ------------------------------------------
        // Only these roles can be created publicly
        // ------------------------------------------
        const allowedRoles = [
            "client",
            "technician",
            "agency"
        ];


        // If no role is provided, default to client
        const selectedRole = role || "client";


        // Prevent anyone from registering as admin
        if (!allowedRoles.includes(selectedRole)) {
            return res.status(403).json({
                message: "Invalid registration role."
            });
        }


        // ------------------------------------------
        // Profile photo
        // ------------------------------------------
        const profile_photo =
            req.file
                ? `profile_photos/${req.file.filename}`
                : null;


        // ------------------------------------------
        // Hash password
        // ------------------------------------------
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );


        // ------------------------------------------
        // Insert user
        // ------------------------------------------
        const sql = `
            INSERT INTO users
            (
                full_name,
                email,
                phone,
                profile_photo,
                password,
                role
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;


        db.query(
            sql,
            [
                full_name,
                email,
                phone,
                profile_photo,
                hashedPassword,
                selectedRole
            ],
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



// ==========================================
// LOGIN USER
// ==========================================
exports.login = (req, res) => {

    const {
        email,
        password
    } = req.body;


    db.query(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }


            // ------------------------------------------
            // User not found
            // ------------------------------------------
            if (results.length === 0) {

                return res.status(401).json({
                    message: "Invalid credentials"
                });

            }


            const user = results[0];


            // ------------------------------------------
            // Compare password
            // ------------------------------------------
            const match = await bcrypt.compare(
                password,
                user.password
            );


            if (!match) {

                return res.status(401).json({
                    message: "Invalid credentials"
                });

            }


            // ------------------------------------------
            // Generate JWT
            // ------------------------------------------
            const token = jwt.sign(
                {
                    user_id: user.user_id,
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );


            // ------------------------------------------
            // Return login information
            // ------------------------------------------
            res.json({

                message: "Login successful",

                token,

                user: {

                    user_id: user.user_id,

                    full_name: user.full_name,

                    email: user.email,

                    phone: user.phone,

                    role: user.role,

                    profile_photo:
                        user.profile_photo
                            ? `http://localhost:5000/uploads/${user.profile_photo}`
                            : null
                }

            });

        }
    );

};