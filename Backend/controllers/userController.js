const db = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const transporter = require("../config/email");

exports.getCurrentUser = (req, res) => {

    const userId = req.user.user_id;

    db.query(
        "SELECT user_id, full_name, email, phone, role, profile_photo, created_at FROM users WHERE user_id = ?",
        [userId],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            const user = results[0];

            user.profile_photo = user.profile_photo
                ? `http://localhost:5000/uploads/profile_photos/${user.profile_photo}`
                : null;

            res.json(user);

        }
    );

};


exports.updateCurrentUser = (req, res) => {

    const userId = req.user.user_id;

    const { full_name, phone } = req.body;

    let sql =
        "UPDATE users SET full_name = ?, phone = ?";

    let values = [full_name, phone];

    if (req.file) {

        sql += ", profile_photo = ?";

        values.push(req.file.filename);

    }

    sql += " WHERE user_id = ?";

    values.push(userId);

    db.query(sql, values, (err) => {

        if (err) {

            return res.status(500).json(err);

        }

        res.json({

            message: "Profile updated successfully"

        });

    });

};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({
                message: "Email address is required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const [users] = await db.promise().query(
            `
                SELECT
                    user_id,
                    full_name,
                    email
                FROM users
                WHERE LOWER(email) = ?
                LIMIT 1
            `,
            [normalizedEmail]
        );

        /*
         * Always return the same response whether
         * the email exists or not.
         *
         * This prevents attackers from discovering
         * which email addresses have ProQuire accounts.
         */
        if (users.length === 0) {
            return res.status(200).json({
                message:
                    "If an account exists with that email, a password reset link has been sent."
            });
        }

        const user = users[0];

        /*
         * Generate a cryptographically secure token.
         *
         * The raw token is sent by email.
         * Only its SHA-256 hash is stored in the database.
         */
        const resetToken = crypto.randomBytes(32).toString("hex");

        const tokenHash = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        /*
         * Token expires after 30 minutes.
         */
        const expiresAt = new Date(
            Date.now() + 30 * 60 * 1000
        );

        /*
         * Invalidate previous unused reset tokens
         * for this account.
         */
        await db.promise().query(
            `
                UPDATE password_reset_tokens
                SET used_at = NOW()
                WHERE user_id = ?
                AND used_at IS NULL
            `,
            [user.user_id]
        );

        /*
         * Store the hashed token.
         */
        await db.promise().query(
            `
                INSERT INTO password_reset_tokens
                (
                    user_id,
                    token_hash,
                    expires_at
                )
                VALUES (?, ?, ?)
            `,
            [
                user.user_id,
                tokenHash,
                expiresAt
            ]
        );

        /*
         * Build the frontend reset URL.
         */
        const resetUrl =
            `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        /*
         * Send password reset email.
         */
        await transporter.sendMail({
            from: `"ProQuire" <${process.env.EMAIL_USER}>`,

            to: user.email,

            subject: "Reset your ProQuire password",

            text: `
Hello ${user.full_name || "there"},

We received a request to reset your ProQuire password.

Use the following link to create a new password:

${resetUrl}

This link will expire in 30 minutes.

If you did not request a password reset, you can safely ignore this email.

ProQuire
            `,

            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto;">

                    <h2 style="color: #4f46e5;">
                        Reset your ProQuire password
                    </h2>

                    <p>
                        Hello ${user.full_name || "there"},
                    </p>

                    <p>
                        We received a request to reset your ProQuire password.
                    </p>

                    <p>
                        Click the button below to create a new password:
                    </p>

                    <p>
                        <a
                            href="${resetUrl}"
                            style="
                                display: inline-block;
                                padding: 12px 20px;
                                background: #4f46e5;
                                color: #ffffff;
                                text-decoration: none;
                                border-radius: 8px;
                                font-weight: 600;
                            "
                        >
                            Reset Password
                        </a>
                    </p>

                    <p>
                        This link will expire in <strong>30 minutes</strong>.
                    </p>

                    <p>
                        If you did not request a password reset,
                        you can safely ignore this email.
                    </p>

                    <p>
                        ProQuire
                    </p>

                </div>
            `
        });

        return res.status(200).json({
            message:
                "If an account exists with that email, a password reset link has been sent."
        });

    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to process the password reset request."
        });
    }
};

exports.resetPassword = async (req, res) => {
    const {
        token,
        new_password
    } = req.body;

    try {

        if (!token || !new_password) {
            return res.status(400).json({
                message:
                    "Reset token and new password are required."
            });
        }

        if (new_password.length < 8) {
            return res.status(400).json({
                message:
                    "New password must be at least 8 characters long."
            });
        }

        /*
         * Hash the token received from the frontend.
         */
        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        /*
         * Find a valid unused token.
         */
        const [resetTokens] = await db.promise().query(
            `
                SELECT
                    reset_id,
                    user_id
                FROM password_reset_tokens
                WHERE token_hash = ?
                AND used_at IS NULL
                AND expires_at > NOW()
                LIMIT 1
            `,
            [tokenHash]
        );

        if (resetTokens.length === 0) {
            return res.status(400).json({
                message:
                    "This password reset link is invalid or has expired."
            });
        }

        const resetRecord = resetTokens[0];

        /*
         * Hash the new password.
         */
        const hashedPassword =
            await bcrypt.hash(
                new_password,
                10
            );

        /*
         * Update the password.
         */
        await db.promise().query(
            `
                UPDATE users
                SET password = ?
                WHERE user_id = ?
            `,
            [
                hashedPassword,
                resetRecord.user_id
            ]
        );

        /*
         * Mark the token as used.
         */
        await db.promise().query(
            `
                UPDATE password_reset_tokens
                SET used_at = NOW()
                WHERE reset_id = ?
            `,
            [resetRecord.reset_id]
        );

        /*
         * Invalidate any other unused reset tokens
         * belonging to this user.
         */
        await db.promise().query(
            `
                UPDATE password_reset_tokens
                SET used_at = NOW()
                WHERE user_id = ?
                AND used_at IS NULL
            `,
            [resetRecord.user_id]
        );

        return res.status(200).json({
            message:
                "Your password has been reset successfully."
        });

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to reset your password."
        });
    }
};

exports.changePassword = async (req, res) => {

    const userId = req.user.user_id;

    const {
        current_password,
        new_password
    } = req.body;

    try {

        // =========================================================
        // Validate request
        // =========================================================

        if (!current_password || !new_password) {

            return res.status(400).json({
                message:
                    "Current password and new password are required."
            });

        }


        if (new_password.length < 8) {

            return res.status(400).json({
                message:
                    "New password must be at least 8 characters long."
            });

        }


        // =========================================================
        // Get current password
        // =========================================================

        const [users] = await db.promise().query(
            `
                SELECT password
                FROM users
                WHERE user_id = ?
            `,
            [userId]
        );


        if (users.length === 0) {

            return res.status(404).json({
                message: "User account not found."
            });

        }


        // =========================================================
        // Verify current password
        // =========================================================

        const passwordMatches =
            await bcrypt.compare(
                current_password,
                users[0].password
            );


        if (!passwordMatches) {

            return res.status(401).json({
                message:
                    "Your current password is incorrect."
            });

        }


        // =========================================================
        // Prevent using the same password
        // =========================================================

        const samePassword =
            await bcrypt.compare(
                new_password,
                users[0].password
            );


        if (samePassword) {

            return res.status(400).json({
                message:
                    "Your new password must be different from your current password."
            });

        }


        // =========================================================
        // Hash new password
        // =========================================================

        const hashedPassword =
            await bcrypt.hash(
                new_password,
                10
            );


        // =========================================================
        // Update password
        // =========================================================

        await db.promise().query(
            `
                UPDATE users
                SET password = ?
                WHERE user_id = ?
            `,
            [
                hashedPassword,
                userId
            ]
        );


        return res.status(200).json({
            message:
                "Password changed successfully."
        });


    } catch (error) {

        console.error(
            "Error changing password:",
            error
        );

        return res.status(500).json({
            message:
                "Unable to change your password.",
            error: error.message
        });

    }

};


exports.deleteCurrentUser = async (req, res) => {

    const userId = req.user.user_id;

    const connection = db.promise();

    try {

        await connection.beginTransaction();


        // =========================================================
        // Get the user's role and related profile IDs
        // =========================================================

        const [users] = await connection.query(
            `
                SELECT
                    user_id,
                    role
                FROM users
                WHERE user_id = ?
                FOR UPDATE
            `,
            [userId]
        );


        if (users.length === 0) {

            await connection.rollback();

            return res.status(404).json({
                message: "User not found."
            });

        }


        const user = users[0];


        // =========================================================
        // Get technician profile ID if this is a technician
        // =========================================================

        let technicianId = null;

        if (user.role === "technician") {

            const [technicians] = await connection.query(
                `
                    SELECT technician_id
                    FROM technician_profiles
                    WHERE user_id = ?
                    FOR UPDATE
                `,
                [userId]
            );

            if (technicians.length > 0) {

                technicianId =
                    technicians[0].technician_id;

            }

        }


        // =========================================================
        // Get agency profile ID if this is an agency
        // =========================================================

        let agencyId = null;

        if (user.role === "agency") {

            const [agencies] = await connection.query(
                `
                    SELECT agency_id
                    FROM agency_profiles
                    WHERE user_id = ?
                    FOR UPDATE
                `,
                [userId]
            );

            if (agencies.length > 0) {

                agencyId =
                    agencies[0].agency_id;

            }

        }


        // =========================================================
        // Delete reports involving this user
        // =========================================================

        await connection.query(
            `
                DELETE FROM reports
                WHERE reporter_id = ?
                OR reported_user_id = ?
            `,
            [userId, userId]
        );


        // =========================================================
        // CLIENT ACCOUNT
        // =========================================================

        if (user.role === "client") {

            // Reviews written by the client
            await connection.query(
                `
                    DELETE FROM reviews
                    WHERE client_id = ?
                `,
                [userId]
            );


            // Service requests created by the client.
            // Reviews attached to these requests are
            // automatically deleted because request_id
            // uses ON DELETE CASCADE.
            await connection.query(
                `
                    DELETE FROM service_requests
                    WHERE client_id = ?
                `,
                [userId]
            );


            // Client profile
            await connection.query(
                `
                    DELETE FROM client_profiles
                    WHERE user_id = ?
                `,
                [userId]
            );

        }


        // =========================================================
        // TECHNICIAN ACCOUNT
        // =========================================================

        if (
            user.role === "technician" &&
            technicianId
        ) {

            // Reviews received by this technician
            await connection.query(
                `
                    DELETE FROM reviews
                    WHERE technician_id = ?
                `,
                [technicianId]
            );


            // Service requests assigned to this technician
            await connection.query(
                `
                    DELETE FROM service_requests
                    WHERE technician_id = ?
                `,
                [technicianId]
            );


            // Technician documents
            await connection.query(
                `
                    DELETE FROM documents
                    WHERE technician_id = ?
                `,
                [technicianId]
            );


            // Technician verification documents
            await connection.query(
                `
                    DELETE FROM verification_documents
                    WHERE technician_id = ?
                `,
                [technicianId]
            );


            // Technician portfolio
            // This table currently has no FK constraint,
            // so it must be deleted manually.
            await connection.query(
                `
                    DELETE FROM technician_portfolio
                    WHERE technician_id = ?
                `,
                [technicianId]
            );


            // Technician profile
            // availability and notifications linked to
            // the profile will be deleted automatically
            // because their FKs use ON DELETE CASCADE.
            await connection.query(
                `
                    DELETE FROM technician_profiles
                    WHERE technician_id = ?
                `,
                [technicianId]
            );

        }


        // =========================================================
        // AGENCY ACCOUNT
        // =========================================================

        if (
            user.role === "agency" &&
            agencyId
        ) {

            // Documents belonging to the agency
            await connection.query(
                `
                    DELETE FROM documents
                    WHERE agency_id = ?
                `,
                [agencyId]
            );


            // Technicians belonging to the agency are NOT deleted.
            // They are converted back to independent technicians.
            await connection.query(
                `
                    UPDATE technician_profiles
                    SET
                        agency_id = NULL,
                        employment_type = 'Independent'
                    WHERE agency_id = ?
                `,
                [agencyId]
            );


            // Agency profile
            await connection.query(
                `
                    DELETE FROM agency_profiles
                    WHERE agency_id = ?
                `,
                [agencyId]
            );

        }


        // =========================================================
        // Delete the user account
        // =========================================================
        //
        // subscriptions.user_id uses ON DELETE CASCADE,
        // so the user's subscriptions and their payments
        // will be removed automatically.
        //

        const [deleteResult] = await connection.query(
            `
                DELETE FROM users
                WHERE user_id = ?
            `,
            [userId]
        );


        if (deleteResult.affectedRows === 0) {

            await connection.rollback();

            return res.status(404).json({
                message: "User account could not be deleted."
            });

        }


        // =========================================================
        // Everything succeeded
        // =========================================================

        await connection.commit();


        return res.status(200).json({
            message: "Your account has been permanently deleted."
        });


    } catch (error) {

        console.error(
            "Error deleting user account:",
            error
        );


        try {
            await connection.rollback();
        } catch (rollbackError) {
            console.error(
                "Error rolling back account deletion:",
                rollbackError
            );
        }


        return res.status(500).json({
            message:
                "Unable to delete your account. No changes were made.",
            error: error.message
        });

    }

};