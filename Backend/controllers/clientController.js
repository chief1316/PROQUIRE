
const db = require("../config/db");

// =====================================================
// CREATE CLIENT PROFILE
// POST /api/clients/profile
// =====================================================

exports.createClientProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { location } = req.body;

    if (!location || !location.trim()) {
      return res.status(400).json({
        message: "Location is required.",
      });
    }

    const [existing] = await db.promise().query(
      `SELECT client_id
       FROM client_profiles
       WHERE user_id = ?`,
      [userId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Client profile already exists.",
      });
    }

    const [result] = await db.promise().query(
      `INSERT INTO client_profiles (user_id, location)
       VALUES (?, ?)`,
      [userId, location.trim()]
    );

    return res.status(201).json({
      message: "Client profile created successfully.",
      client_profile: {
        client_id: result.insertId,
        user_id: userId,
        location: location.trim(),
      },
    });
  } catch (error) {
    console.error("Create client profile error:", error);

    return res.status(500).json({
      message: "Failed to create client profile.",
    });
  }
};


// =====================================================
// GET MY CLIENT PROFILE
// GET /api/clients/my-profile
// =====================================================

exports.getMyClientProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [profiles] = await db.promise().query(
      `SELECT
          cp.client_id,
          cp.user_id,
          u.full_name,
          u.email,
          u.phone,
          cp.location
       FROM client_profiles cp
       INNER JOIN users u
         ON cp.user_id = u.user_id
       WHERE cp.user_id = ?`,
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        message: "Client profile not found. Please complete your profile.",
      });
    }

    return res.status(200).json(profiles[0]);
  } catch (error) {
    console.error("Get client profile error:", error);

    return res.status(500).json({
      message: "Failed to fetch client profile.",
    });
  }
};


// =====================================================
// GET CLIENT PROFILE BY ID
// GET /api/clients/:clientId
// =====================================================

exports.getClientProfileById = async (req, res) => {
  try {
    const { clientId } = req.params;

    const [profiles] = await db.promise().query(
      `SELECT
          cp.client_id,
          cp.user_id,
          u.full_name,
          u.email,
          u.phone,
          cp.location
       FROM client_profiles cp
       INNER JOIN users u
         ON cp.user_id = u.user_id
       WHERE cp.client_id = ?`,
      [clientId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        message: "Client profile not found.",
      });
    }

    return res.status(200).json(profiles[0]);
  } catch (error) {
    console.error("Get client profile by ID error:", error);

    return res.status(500).json({
      message: "Failed to fetch client profile.",
    });
  }
};


// =====================================================
// UPDATE OR COMPLETE CLIENT PROFILE
// PATCH /api/clients/profile
// =====================================================


exports.updateClientProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const {
      full_name,
      email,
      phone,
      location,
    } = req.body;

    // Validate required fields
    if (
      !full_name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !location?.trim()
    ) {
      return res.status(400).json({
        message:
          "Please provide your name, email, phone, and location.",
      });
    }

    const cleanName = full_name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();
    const cleanLocation = location.trim();

    // Validate email
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    if (cleanName.length > 100) {
      return res.status(400).json({
        message:
          "Full name must not exceed 100 characters.",
      });
    }

    if (cleanEmail.length > 255) {
      return res.status(400).json({
        message: "Email address is too long.",
      });
    }

    if (cleanPhone.length > 30) {
      return res.status(400).json({
        message:
          "Phone number must not exceed 30 characters.",
      });
    }

    if (cleanLocation.length > 255) {
      return res.status(400).json({
        message:
          "Location must not exceed 255 characters.",
      });
    }

    // Check if the user exists
    const [users] = await db.promise().query(
      `SELECT user_id
       FROM users
       WHERE user_id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User account not found.",
      });
    }

    // Check if the email belongs to another account
    const [existingUsers] = await db.promise().query(
      `SELECT user_id
       FROM users
       WHERE email = ?
       AND user_id != ?`,
      [cleanEmail, userId]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message:
          "This email address is already registered to another account.",
      });
    }

    // Update name, email, and phone in users
    await db.promise().query(
      `UPDATE users
       SET full_name = ?,
           email = ?,
           phone = ?
       WHERE user_id = ?`,
      [
        cleanName,
        cleanEmail,
        cleanPhone,
        userId,
      ]
    );

    // Check whether the client profile exists
    const [profiles] = await db.promise().query(
      `SELECT client_id
       FROM client_profiles
       WHERE user_id = ?`,
      [userId]
    );

    // Create the profile if it does not exist.
    // Otherwise, update its location.
    if (profiles.length === 0) {
      await db.promise().query(
        `INSERT INTO client_profiles
         (user_id, location)
         VALUES (?, ?)`,
        [userId, cleanLocation]
      );
    } else {
      await db.promise().query(
        `UPDATE client_profiles
         SET location = ?
         WHERE user_id = ?`,
        [cleanLocation, userId]
      );
    }

    // Get the updated profile
    const [updatedProfiles] =
      await db.promise().query(
        `SELECT
            cp.client_id,
            cp.user_id,
            u.full_name,
            u.email,
            u.phone,
            cp.location
         FROM client_profiles cp
         INNER JOIN users u
           ON cp.user_id = u.user_id
         WHERE cp.user_id = ?`,
        [userId]
      );

    return res.status(200).json({
      message:
        "Your client profile has been saved successfully.",
      profile: updatedProfiles[0],
    });

  } catch (error) {
    console.error(
      "Save client profile error:",
      error
    );

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message:
          "This email address is already registered.",
      });
    }

    return res.status(500).json({
      message: "Unable to save client profile.",
    });
  }
};


// =====================================================
// DELETE CLIENT PROFILE
// DELETE /api/clients/profile
// =====================================================

exports.deleteClientProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [profiles] = await db.promise().query(
      `SELECT client_id
       FROM client_profiles
       WHERE user_id = ?`,
      [userId]
    );

    if (profiles.length === 0) {
      return res.status(404).json({
        message: "Client profile not found.",
      });
    }

    await db.promise().query(
      `DELETE FROM client_profiles
       WHERE user_id = ?`,
      [userId]
    );

    return res.status(200).json({
      message: "Client profile deleted successfully.",
      client_id: profiles[0].client_id,
    });

  } catch (error) {
    console.error("Delete client profile error:", error);

    return res.status(500).json({
      message: "Failed to delete client profile.",
    });
  }
};