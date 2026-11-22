const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const transporter = require("../config/email");

const TERMS_VERSION = "1.0";
const PRIVACY_VERSION = "1.0";

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
      role,
      accepted_terms,
      accepted_privacy_policy,
    } = req.body;

    // ------------------------------------------
    // Validate legal consent
    // ------------------------------------------
    if (accepted_terms !== true || accepted_privacy_policy !== true) {
      return res.status(400).json({
        message:
          "You must agree to the Terms of Service and acknowledge the Privacy Policy before registering.",
      });
    }

    // ------------------------------------------
    // Only these roles can be created publicly
    // ------------------------------------------
    const allowedRoles = ["client", "technician", "agency"];

    // If no role is provided, default to client
    const selectedRole = role || "client";

    // Prevent anyone from registering as admin
    if (!allowedRoles.includes(selectedRole)) {
      return res.status(403).json({
        message: "Invalid registration role.",
      });
    }

    // ------------------------------------------
    // Profile photo
    // ------------------------------------------
    const profile_photo = req.file
      ? `profile_photos/${req.file.filename}`
      : null;

    // ------------------------------------------
    // Hash password
    // ------------------------------------------
    const hashedPassword = await bcrypt.hash(password, 10);

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
        role,
        accepted_terms,
        accepted_privacy_policy,
        legal_accepted_at,
        terms_version,
        privacy_version
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
`;

    db.query(
      sql,
      [
        full_name,
        email,
        phone,
        profile_photo,
        hashedPassword,
        selectedRole,
        1,
        1,
        TERMS_VERSION,
        PRIVACY_VERSION,
      ],
      async (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        // ------------------------------------------
        // Send ProQuire welcome email
        // ------------------------------------------
        try {
          await transporter.sendMail({
            from: `"ProQuire" <${process.env.EMAIL_USER}>`,

            to: email,

            subject: "Welcome to ProQuire!",

            text: `
Hello ${full_name},

Welcome to ProQuire!

Your account has been successfully created.

We are excited to have you join our platform. ProQuire connects clients with skilled technicians and trusted service providers.

Thank you for choosing ProQuire!

Best regards,
The ProQuire Team
                `,

            html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 600px; margin: 0 auto;">

                        <h2 style="color: #4f46e5;">
                            Welcome to ProQuire!
                        </h2>

                        <p>Hello ${full_name},</p>

                        <p>
                            Your account has been successfully created.
                        </p>

                        <p>
                            We are excited to have you join ProQuire!
                            Our platform connects clients with skilled
                            technicians and trusted service providers.
                        </p>

                        <p>
                            Thank you for choosing ProQuire.
                        </p>

                        <p>
                            Best regards,<br/>
                            <strong>The ProQuire Team</strong>
                        </p>

                    </div>
                `,
          });

          console.log("Welcome email sent successfully to:", email);
        } catch (emailError) {
          console.error("Welcome email error:", emailError);
        }

        // Registration succeeds even if email delivery fails.
        return res.status(201).json({
          message: "User registered successfully",
        });
      },
    );
  } catch (error) {
    res.status(500).json(error);
  }
};

// ==========================================
// LOGIN USER
// ==========================================
exports.login = (req, res) => {
  const { email, password } = req.body;

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
          message: "Invalid credentials",
        });
      }

      const user = results[0];

      // Block deactivated accounts
      if (Number(user.is_active) !== 1) {
        return res.status(403).json({
          message:
            "Your account has been deactivated. Please contact the administrator.",
        });
      }

      // ------------------------------------------
      // Compare password
      // ------------------------------------------
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }

      // ------------------------------------------
      // Generate JWT
      // ------------------------------------------
      const token = jwt.sign(
        {
          user_id: user.user_id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "1d",
        },
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

          profile_photo: user.profile_photo
            ? `http://localhost:5000/uploads/${user.profile_photo}`
            : null,
        },
      });
    },
  );
};

// ==========================================
// CHANGE PASSWORD
// ==========================================
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const { current_password, new_password } = req.body;

    // ------------------------------------------
    // Validate required fields
    // ------------------------------------------
    if (!current_password || !new_password) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    // ------------------------------------------
    // Validate new password length
    // ------------------------------------------
    if (new_password.length < 8) {
      return res.status(400).json({
        message: "New password must be at least 8 characters long.",
      });
    }

    // ------------------------------------------
    // Get current password
    // ------------------------------------------
    db.query(
      `
                SELECT password
                FROM users
                WHERE user_id = ?
            `,
      [userId],
      async (err, results) => {
        if (err) {
          console.error("Error retrieving password:", err);

          return res.status(500).json({
            message: "Unable to change password.",
          });
        }

        if (results.length === 0) {
          return res.status(404).json({
            message: "User account not found.",
          });
        }

        const user = results[0];

        // ------------------------------------------
        // Verify current password
        // ------------------------------------------
        const passwordMatches = await bcrypt.compare(
          current_password,
          user.password,
        );

        if (!passwordMatches) {
          return res.status(401).json({
            message: "Current password is incorrect.",
          });
        }

        // ------------------------------------------
        // Prevent using the same password
        // ------------------------------------------
        const samePassword = await bcrypt.compare(new_password, user.password);

        if (samePassword) {
          return res.status(400).json({
            message:
              "Your new password must be different from your current password.",
          });
        }

        // ------------------------------------------
        // Hash new password
        // ------------------------------------------
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // ------------------------------------------
        // Update password
        // ------------------------------------------
        db.query(
          `
                        UPDATE users
                        SET password = ?
                        WHERE user_id = ?
                    `,
          [hashedPassword, userId],
          (updateError) => {
            if (updateError) {
              console.error("Error updating password:", updateError);

              return res.status(500).json({
                message: "Unable to change password.",
              });
            }

            return res.status(200).json({
              message: "Password changed successfully.",
            });
          },
        );
      },
    );
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Unable to change password.",
    });
  }
};
