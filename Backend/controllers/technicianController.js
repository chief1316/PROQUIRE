const db = require("../config/db");
const crypto = require("crypto");
const supabase = require("../config/supabase");
const path = require("path");
const { analyzeDocument } = require("../services/geminiService");

const STORAGE_BUCKET = "proquire-private";

// ======================================================
// Get All Verified Technicians
// ======================================================

exports.getAllTechnicians = (req, res) => {
  const sql = `
    SELECT
      tp.technician_id,
      tp.user_id,
      tp.category_id,
      u.full_name,
      u.email,
      u.phone,
      u.profile_photo,
      c.category_name,
      tp.bio,
      tp.years_experience,
      tp.location,
      tp.is_verified,
      COALESCE(AVG(r.rating), 0) AS average_rating,
      COUNT(r.review_id) AS review_count

    FROM technician_profiles tp

    JOIN users u
      ON tp.user_id = u.user_id

    JOIN categories c
      ON tp.category_id = c.category_id

    LEFT JOIN reviews r
      ON r.technician_id = tp.technician_id

    WHERE tp.is_verified = 1

    GROUP BY
      tp.technician_id,
      tp.user_id,
      u.full_name,
      u.email,
      u.phone,
      u.profile_photo,
      c.category_name,
      tp.bio,
      tp.years_experience,
      tp.location,
      tp.is_verified

    ORDER BY tp.technician_id DESC
  `;

  db.query(sql, (err, technicians) => {
    if (err) {
      console.error("Error fetching technicians:", err);

      return res.status(500).json({
        message: "Error fetching technicians",
        error: err,
      });
    }

    const portfolioSql = `
      SELECT
        portfolio_id,
        technician_id,
        title,
        image_path,
        project_description
      FROM technician_portfolio
      ORDER BY uploaded_at DESC
    `;

    db.query(portfolioSql, (portfolioErr, portfolioItems) => {
      if (portfolioErr) {
        console.error("Error fetching technician portfolios:", portfolioErr);

        return res.status(500).json({
          message: "Error fetching technician portfolios",
          error: portfolioErr,
        });
      }

      const results = technicians.map((technician) => ({
        ...technician,
        average_rating: Number(technician.average_rating || 0),
        review_count: Number(technician.review_count || 0),
        portfolio: portfolioItems.filter(
          (item) =>
            Number(item.technician_id) === Number(technician.technician_id),
        ),
      }));

      res.status(200).json(results);
    });
  });
};

// ======================================================
// Get Technician By ID
// ======================================================

exports.getTechnicianById = (req, res) => {
  const { id } = req.params;

  const sql = `
        SELECT
            tp.technician_id,
            tp.user_id,
            u.full_name,
            u.email,
            u.phone,
            c.category_name,
            tp.bio,
            tp.years_experience,
            tp.location,
            tp.is_verified

        FROM technician_profiles tp

        JOIN users u
            ON tp.user_id = u.user_id

        JOIN categories c
            ON tp.category_id = c.category_id

        WHERE tp.technician_id = ?
        AND tp.is_verified = 1
    `;

  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching technician",
        error: err,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Technician not found",
      });
    }

    res.status(200).json(results[0]);
  });
};

// ======================================================
// Get My Technician Profile
// Logged-in Technician
// ======================================================

exports.getMyProfile = (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
    SELECT
      tp.technician_id,
      tp.user_id,
      u.full_name,
      u.email,
      u.phone,
      u.profile_photo,
      c.category_name,
      tp.category_id,
      tp.bio,
      tp.years_experience,
      tp.location,
      tp.employment_type,
      tp.agency_id,
      ap.company_name AS agency_name,
      tp.is_verified,

      CASE
        WHEN tp.is_verified = 1 THEN 'approved'

        WHEN EXISTS (
          SELECT 1
          FROM verification_documents vd_pending
          WHERE vd_pending.technician_id = tp.technician_id
          AND vd_pending.verification_status = 'pending'
        ) THEN 'pending'

        WHEN EXISTS (
          SELECT 1
          FROM verification_documents vd_rejected
          WHERE vd_rejected.technician_id = tp.technician_id
          AND vd_rejected.verification_status = 'rejected'
        ) THEN 'rejected'

        ELSE 'pending'
      END AS verification_status,

      (
        SELECT vd_reason.rejection_reason
        FROM verification_documents vd_reason
        WHERE vd_reason.technician_id = tp.technician_id
        AND vd_reason.verification_status = 'rejected'
        AND vd_reason.rejection_reason IS NOT NULL
        AND TRIM(vd_reason.rejection_reason) <> ''
        ORDER BY vd_reason.uploaded_at DESC
        LIMIT 1
      ) AS rejection_reason

    FROM technician_profiles tp

    JOIN users u
      ON tp.user_id = u.user_id

    JOIN categories c
      ON tp.category_id = c.category_id

    LEFT JOIN agency_profiles ap
      ON tp.agency_id = ap.agency_id

    WHERE tp.user_id = ?
  `;

  db.query(sql, [user_id], async (err, results) => {
    if (err) {
      console.error("Error fetching technician profile:", err);

      return res.status(500).json({
        message: "Error fetching your technician profile.",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Technician profile not found.",
      });
    }

    const profile = results[0];

    // Generate a temporary URL for the private Supabase photo.
    profile.profile_photo_url = null;

    if (
      profile.profile_photo &&
      !profile.profile_photo.startsWith("http://") &&
      !profile.profile_photo.startsWith("https://")
    ) {
      const { data, error: signedUrlError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(profile.profile_photo, 3600);

      if (signedUrlError) {
        console.error(
          "Profile photo signed URL error:",
          signedUrlError.message,
        );
      } else {
        profile.profile_photo_url = data.signedUrl;
      }
    }

    return res.status(200).json(profile);
  });
};

exports.uploadMyProfilePhoto = async (req, res) => {
  let uploadedPath = null;

  try {
    // Only technicians can upload technician profile photos.
    if (req.user.role !== "technician") {
      return res.status(403).json({
        message: "Only technicians can upload profile photos.",
      });
    }

    const photo = req.file;

    if (!photo) {
      return res.status(400).json({
        message: "Please select a profile photo.",
      });
    }

    // Validate image type.
    const allowedTypes = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
    };

    const extension = allowedTypes[photo.mimetype];

    if (!extension) {
      return res.status(400).json({
        message: "Profile photo must be JPG, PNG or WEBP.",
      });
    }

    // Find the technician profile and existing photo.
    const findSql = `
      SELECT
        tp.technician_id,
        u.profile_photo
      FROM technician_profiles tp
      JOIN users u ON u.user_id = tp.user_id
      WHERE tp.user_id = ?
    `;

    const [profile] = await new Promise((resolve, reject) => {
      db.query(findSql, [req.user.user_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (!profile) {
      return res.status(404).json({
        message: "Technician profile not found.",
      });
    }

    const technicianId = profile.technician_id;
    const oldPhotoPath = profile.profile_photo;

    // Generate a unique storage path.
    uploadedPath =
      `technicians/${technicianId}/profile/` +
      `${crypto.randomUUID()}${extension}`;

    // Upload the photo to Supabase.
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(uploadedPath, photo.buffer, {
        contentType: photo.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error("Profile photo upload error:", uploadError);

      return res.status(500).json({
        message: "Unable to upload profile photo.",
      });
    }

    // Save the Supabase path in the users table.
    await new Promise((resolve, reject) => {
      db.query(
        `UPDATE users SET profile_photo = ? WHERE user_id = ?`,
        [uploadedPath, req.user.user_id],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        },
      );
    });

    // Delete the previous photo only if it belongs to this
    // technician's profile folder.
    const oldPhotoPrefix = `technicians/${technicianId}/profile/`;

    if (
      oldPhotoPath &&
      oldPhotoPath.startsWith(oldPhotoPrefix) &&
      oldPhotoPath !== uploadedPath
    ) {
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([oldPhotoPath]);

      if (deleteError) {
        console.error("Old profile photo cleanup error:", deleteError.message);
      }
    }

    // Generate a temporary display URL.
    const { data: signedData, error: signedError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(uploadedPath, 3600);

    if (signedError) {
      console.error("Profile photo signed URL error:", signedError);

      return res.status(200).json({
        message: "Profile photo uploaded successfully.",
        profile_photo: uploadedPath,
        profile_photo_url: null,
      });
    }

    return res.status(200).json({
      message: "Profile photo uploaded successfully.",
      profile_photo: uploadedPath,
      profile_photo_url: signedData.signedUrl,
    });
  } catch (error) {
    console.error("========== PROFILE PHOTO ERROR ==========");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Stack:", error.stack);
    console.error("==========================================");

    // Remove the new upload if saving the database record failed.
    if (uploadedPath) {
      const { error: cleanupError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([uploadedPath]);

      if (cleanupError) {
        console.error("Profile photo cleanup error:", cleanupError.message);
      }
    }

    return res.status(500).json({
      message: "Unable to update technician profile photo.",
    });
  }
};

// ======================================================
// Get My Verification Documents
// Logged-in Technician Only
// ======================================================

exports.getMyVerificationDocuments = (req, res) => {
  const user_id = req.user.user_id;

  const sql = `
        SELECT
            vd.document_id,
            vd.technician_id,
            vd.document_type,
            vd.verification_status,
            vd.is_current,
            vd.rejection_reason,
            vd.uploaded_at
        FROM verification_documents vd

        JOIN technician_profiles tp
            ON vd.technician_id = tp.technician_id

        WHERE tp.user_id = ?

        ORDER BY vd.uploaded_at DESC, vd.document_id DESC
    `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching technician verification documents:", err);

      return res.status(500).json({
        message: "Unable to retrieve your verification documents.",
      });
    }

    return res.status(200).json(results);
  });
};

// ======================================================
// Get Technicians By Category
// ======================================================

exports.getTechniciansByCategory = (req, res) => {
  const { categoryId } = req.params;

  const sql = `
        SELECT
            tp.technician_id,
            tp.user_id,
            u.full_name,
            u.email,
            u.phone,
            c.category_name,
            tp.bio,
            tp.years_experience,
            tp.location,
            tp.is_verified

        FROM technician_profiles tp

        JOIN users u
            ON tp.user_id = u.user_id

        JOIN categories c
            ON tp.category_id = c.category_id

        WHERE tp.category_id = ?

        ORDER BY tp.technician_id DESC
    `;

  db.query(sql, [categoryId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching technicians",
        error: err,
      });
    }

    res.status(200).json(results);
  });
};

// ======================================================
// Verify Technician
// Admin Only
// ======================================================

exports.verifyTechnician = (req, res) => {
  const { id } = req.params;

  const sql1 = `
        UPDATE technician_profiles
        SET is_verified = 1
        WHERE technician_id = ?
    `;

  db.query(sql1, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error verifying technician",
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Technician not found",
      });
    }

    const sql2 = `
            UPDATE verification_documents
            SET verification_status = 'approved'
            WHERE technician_id = ?
        `;

    db.query(sql2, [id], (err2) => {
      if (err2) {
        return res.status(500).json({
          message: "Technician verified but document status update failed",
          error: err2,
        });
      }

      res.status(200).json({
        message: "Technician and documents verified successfully",
      });
    });
  });
};

// ======================================================
// Upload Verification Document
// Gemini AI Verification
// ======================================================

exports.uploadVerificationDocument = async (req, res) => {
  const documentFile = req.files?.document?.[0];
  const selfieFile = req.files?.selfie?.[0];

  const uploadedPaths = [];
  let documentSaved = false;

  // Helper: execute database queries using async/await
  const query = (sql, params = []) =>
    new Promise((resolve, reject) => {
      db.query(sql, params, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

  // Helper: remove files if a later operation fails
  const cleanupUploads = async () => {
    if (!uploadedPaths.length) return;

    try {
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(uploadedPaths);

      if (error) {
        console.error("Supabase cleanup error:", error.message);
      }
    } catch (error) {
      console.error("Storage cleanup failed:", error.message);
    }
  };

  try {
    // ---------------------------------------------
    // Validate user
    // ---------------------------------------------

    if (req.user.role !== "technician") {
      return res.status(403).json({
        message: "Only technician accounts can upload verification documents.",
      });
    }

    const { technician_id, document_type, replaces_document_id } = req.body;

    if (!documentFile) {
      return res.status(400).json({
        message: "Please upload a verification document.",
      });
    }

    if (!technician_id || !document_type) {
      return res.status(400).json({
        message: "technician_id and document_type are required.",
      });
    }

    if (document_type === "National ID" && !selfieFile) {
      return res.status(400).json({
        message: "Please upload a selfie holding your National ID.",
      });
    }

    if (
      !Number.isInteger(Number(technician_id)) ||
      Number(technician_id) <= 0
    ) {
      return res.status(400).json({
        message: "Invalid technician ID.",
      });
    }

    // ---------------------------------------------
    // Validate ownership and replacement
    // ---------------------------------------------

    const ownershipSql = `
      SELECT
        tp.technician_id,
        vd.document_id AS replacement_document_id
      FROM technician_profiles tp
      LEFT JOIN verification_documents vd
        ON vd.document_id = ?
        AND vd.technician_id = tp.technician_id
        AND vd.document_type = ?
        AND vd.verification_status = 'approved'
        AND vd.is_current = 1
      WHERE tp.technician_id = ?
        AND tp.user_id = ?
    `;

    const ownershipResults = await query(ownershipSql, [
      replaces_document_id || null,
      document_type,
      Number(technician_id),
      req.user.user_id,
    ]);

    if (ownershipResults.length === 0) {
      return res.status(403).json({
        message:
          "You can only upload documents for your own technician profile.",
      });
    }

    if (replaces_document_id && !ownershipResults[0].replacement_document_id) {
      return res.status(400).json({
        message: "The document you selected cannot be replaced.",
      });
    }

    // ---------------------------------------------
    // Generate unique Supabase storage paths
    // ---------------------------------------------

    const documentExtension = ".pdf";

    const documentPath =
      `technicians/${technician_id}/verification/documents/` +
      `${crypto.randomUUID()}${documentExtension}`;

    let selfiePath = null;

    if (selfieFile) {
      const selfieExtensions = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
      };

      const selfieExtension = selfieExtensions[selfieFile.mimetype];

      if (!selfieExtension) {
        return res.status(400).json({
          message: "Selfie must be a JPEG, PNG, or WEBP image.",
        });
      }

      selfiePath =
        `technicians/${technician_id}/verification/selfies/` +
        `${crypto.randomUUID()}${selfieExtension}`;
    }

    // ---------------------------------------------
    // Upload document to private Supabase storage
    // ---------------------------------------------

    const { error: documentUploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(documentPath, documentFile.buffer, {
        contentType: documentFile.mimetype,
        upsert: false,
      });

    if (documentUploadError) {
      console.error("Technician document upload error:", documentUploadError);

      return res.status(500).json({
        message: "Unable to upload verification document.",
      });
    }

    uploadedPaths.push(documentPath);

    // ---------------------------------------------
    // Upload selfie if provided
    // ---------------------------------------------

    if (selfieFile && selfiePath) {
      const { error: selfieUploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(selfiePath, selfieFile.buffer, {
          contentType: selfieFile.mimetype,
          upsert: false,
        });

      if (selfieUploadError) {
        console.error("Technician selfie upload error:", selfieUploadError);

        await cleanupUploads();

        return res.status(500).json({
          message: "Unable to upload verification selfie.",
        });
      }

      uploadedPaths.push(selfiePath);
    }

    // ---------------------------------------------
    // Generate document ID from TiDB sequence
    // ---------------------------------------------

    const documentSequence = await query(`
      SELECT NEXTVAL(verification_documents_document_id_seq) AS document_id
    `);

    const documentId = Number(documentSequence[0].document_id);

    if (!Number.isInteger(documentId) || documentId <= 0) {
      throw new Error("Unable to generate verification document ID.");
    }

    // ---------------------------------------------
    // Save document information
    // ---------------------------------------------

    const insertDocumentSql = `
      INSERT INTO verification_documents
      (
        document_id,
        technician_id,
        document_type,
        document_path,
        selfie_path,
        replaces_document_id,
        is_current
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await query(insertDocumentSql, [
      documentId,
      Number(technician_id),
      document_type,
      documentPath,
      selfiePath,
      replaces_document_id || null,
      replaces_document_id ? 0 : 1,
    ]);

    documentSaved = true;

    // ---------------------------------------------
    // Run Gemini AI analysis using the file buffer
    // ---------------------------------------------

    console.log("Starting technician Gemini verification...");

    let aiResult;

    try {
      aiResult = await analyzeDocument(
        documentFile.buffer,
        documentFile.mimetype,
        "technician",
      );

      console.log("Technician Gemini verification completed.");
    } catch (aiError) {
      console.error("Gemini technician analysis failed:", aiError.message);

      return res.status(201).json({
        message:
          "Document uploaded, but AI analysis failed. Admin review is required.",

        document: {
          document_id: documentId,
          technician_id: Number(technician_id),
          document_type,
          document_path: documentPath,
          selfie_path: selfiePath,
          verification_status: "pending",
        },

        ai_verification: {
          status: "failed",
          message:
            "AI analysis could not be completed. Admin review is required.",
        },
      });
    }

    // ---------------------------------------------
    // Generate AI verification ID
    // ---------------------------------------------

    const verificationSequence = await query(`
      SELECT NEXTVAL(ai_verifications_verification_id_seq) AS verification_id
    `);

    const verificationId = Number(verificationSequence[0].verification_id);

    if (!Number.isInteger(verificationId) || verificationId <= 0) {
      console.error("Invalid AI verification sequence value.");

      return res.status(201).json({
        message:
          "Document uploaded and analyzed, but the AI result could not be saved.",
        document: {
          document_id: documentId,
          technician_id: Number(technician_id),
          document_type,
          document_path: documentPath,
          selfie_path: selfiePath,
          verification_status: "pending",
        },
      });
    }

    // ---------------------------------------------
    // Save AI result
    // ---------------------------------------------

    const aiSql = `
      INSERT INTO ai_verifications
      (
        verification_id,
        document_id,
        confidence_score,
        verification_result,
        verified_by,
        remarks
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
      await query(aiSql, [
        verificationId,
        documentId,
        aiResult.confidence_score,
        aiResult.verification_result,
        "Gemini AI",
        aiResult.remarks,
      ]);
    } catch (aiDatabaseError) {
      console.error("AI result database error:", aiDatabaseError);

      return res.status(201).json({
        message:
          "Document uploaded and analyzed, but AI result could not be saved.",

        document: {
          document_id: documentId,
          technician_id: Number(technician_id),
          document_type,
          document_path: documentPath,
          selfie_path: selfiePath,
          verification_status: "pending",
        },
      });
    }

    // ---------------------------------------------
    // Final response
    // ---------------------------------------------

    return res.status(201).json({
      message: "Verification document uploaded and analyzed successfully.",

      document: {
        document_id: documentId,
        technician_id: Number(technician_id),
        document_type,
        document_path: documentPath,
        selfie_path: selfiePath,
        verification_status: "pending",
      },

      ai_verification: {
        verification_id: verificationId,
        verification_result: aiResult.verification_result,
        confidence_score: aiResult.confidence_score,
        document_type: aiResult.document_type,
        remarks: aiResult.remarks,
      },
    });
  } catch (error) {
    console.error("========== TECHNICIAN UPLOAD ERROR ==========");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Details:", error.details);
    console.error("Hint:", error.hint);
    console.error("Stack:", error.stack);
    console.error("==============================================");

    // Only delete uploaded files if the database record
    // has NOT been successfully saved.
    if (!documentSaved) {
      await cleanupUploads();
    }

    return res.status(500).json({
      message: "Unable to upload technician verification document.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ======================================================
// Get Pending Technicians
// Admin Only
// Includes AI Verification Results
// ======================================================

exports.getPendingTechnicians = (req, res) => {
  const sql = `
        SELECT
            tp.technician_id,
            u.full_name,
            tp.bio,
            tp.location,

            vd.document_id,
            vd.document_type,
            vd.document_path,
            vd.selfie_path,
            vd.verification_status,

            av.verification_id,
            av.confidence_score,
            av.verification_result,
            av.remarks,
            av.verification_date,
            av.verified_by

        FROM technician_profiles tp

        JOIN users u
            ON tp.user_id = u.user_id

        JOIN verification_documents vd
            ON tp.technician_id = vd.technician_id

        LEFT JOIN ai_verifications av
            ON vd.document_id = av.document_id

        WHERE vd.verification_status = 'pending'

        ORDER BY vd.uploaded_at DESC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching pending technicians:", err);

      return res.status(500).json({
        message: "Error fetching pending technicians",
        error: err,
      });
    }

    res.status(200).json(results);
  });
};

// Get verified technicians belonging to the logged-in agency
exports.getMyAgencyTechnicians = (req, res) => {
  const userId = req.user.user_id;

  const sql = `
        SELECT
            tp.technician_id,
            tp.user_id,
            u.full_name,
            u.email,
            u.phone,
            c.category_name,
            tp.bio,
            tp.years_experience,
            tp.location,
            tp.is_verified,
            tp.employment_type,
            tp.agency_id

        FROM technician_profiles tp

        JOIN users u
            ON tp.user_id = u.user_id

        JOIN categories c
            ON tp.category_id = c.category_id

        JOIN agency_profiles ap
            ON tp.agency_id = ap.agency_id

        WHERE ap.user_id = ?
        AND tp.employment_type = 'Agency'
        AND tp.is_verified = 1

        ORDER BY u.full_name ASC
    `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error fetching agency technicians:", err);

      return res.status(500).json({
        message: "Error fetching agency technicians",
      });
    }

    return res.status(200).json(results);
  });
};

// ======================================================
// Create Technician Profile
// ======================================================

exports.createProfile = (req, res) => {
  if (req.user.role !== "technician") {
    return res.status(403).json({
      message: "Only technician accounts can create technician profiles.",
    });
  }

  const user_id = req.user.user_id;

  const {
    category_id,
    bio,
    years_experience,
    location,
    employment_type,
    agency_id,
  } = req.body;

  /*
    |--------------------------------------------------------------------------
    | Validate agency selection
    |--------------------------------------------------------------------------
    */

  if (employment_type === "Agency" && !agency_id) {
    return res.status(400).json({
      message: "Please select an agency.",
    });
  }

  /*
    |--------------------------------------------------------------------------
    | Check if technician profile already exists
    |--------------------------------------------------------------------------
    */

  const checkSql = `
        SELECT technician_id
        FROM technician_profiles
        WHERE user_id = ?
    `;

  db.query(checkSql, [user_id], (checkErr, checkResults) => {
    if (checkErr) {
      return res.status(500).json({
        message: "Error checking technician profile",
        error: checkErr,
      });
    }

    if (checkResults.length > 0) {
      return res.status(409).json({
        message: "Technician profile already exists",
      });
    }

    /*
            |--------------------------------------------------------------------------
            | Create technician profile
            |--------------------------------------------------------------------------
            */

    const insertSql = `
                INSERT INTO technician_profiles
                (
                    user_id,
                    category_id,
                    bio,
                    years_experience,
                    location,
                    employment_type,
                    agency_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

    db.query(
      insertSql,
      [
        user_id,
        category_id,
        bio,
        years_experience,
        location,
        employment_type,
        employment_type === "Agency" ? agency_id : null,
      ],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            message: "Error creating technician profile",
            error: err,
          });
        }

        res.status(201).json({
          message: "Technician profile created successfully",

          technician_id: result.insertId,
        });
      },
    );
  });
};

// Get AI verification results for admin review
exports.getAIVerificationResults = (req, res) => {
  const sql = `
        SELECT
            av.verification_id,
            av.document_id,
            av.verification_result,
            av.confidence_score,
            av.verification_date,
            av.verified_by,
            av.remarks,

            vd.technician_id,
            vd.document_type,
            vd.document_path,
            vd.verification_status,
            vd.uploaded_at,

            u.user_id,
            u.full_name,
            u.email,
            u.phone

        FROM ai_verifications av

        JOIN verification_documents vd
            ON av.document_id = vd.document_id

        JOIN technician_profiles tp
            ON vd.technician_id = tp.technician_id

        JOIN users u
            ON tp.user_id = u.user_id

        ORDER BY av.verification_date DESC
    `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching AI verification results:", err);

      return res.status(500).json({
        message: "Failed to fetch AI verification results.",
        error: err,
      });
    }

    res.status(200).json(results);
  });
};

// ======================================================
// Admin Final Review of Verification Document
// Admin Only
// ======================================================

exports.reviewVerificationDocument = (req, res) => {
  const { documentId } = req.params;
  const { decision, rejection_reason } = req.body;

  // Validate admin decision
  if (!decision || !["approved", "rejected"].includes(decision)) {
    return res.status(400).json({
      message: "Decision must be either 'approved' or 'rejected.'",
    });
  }

  // Validate rejection reason
  if (
    decision === "rejected" &&
    (!rejection_reason || !rejection_reason.trim())
  ) {
    return res.status(400).json({
      message: "A rejection reason is required when rejecting a document.",
    });
  }

  const finalRejectionReason =
    decision === "rejected" ? rejection_reason.trim() : null;

  // Retrieve document and replacement information
  const getDocumentSql = `
        SELECT
            technician_id,
            replaces_document_id
        FROM verification_documents
        WHERE document_id = ?
    `;

  db.query(getDocumentSql, [documentId], (err, results) => {
    if (err) {
      console.error("Error finding verification document:", err);

      return res.status(500).json({
        message: "Error finding verification document.",
        error: err,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Verification document not found.",
      });
    }

    const technicianId = results[0].technician_id;
    const replacesDocumentId = results[0].replaces_document_id;

    // Update the document's review status.
    // Do not make a replacement current yet.
    const updateDocumentSql = `
            UPDATE verification_documents
            SET
                verification_status = ?,
                rejection_reason = ?
            WHERE document_id = ?
        `;

    db.query(
      updateDocumentSql,
      [decision, finalRejectionReason, documentId],
      (updateErr) => {
        if (updateErr) {
          console.error("Error updating verification document:", updateErr);

          return res.status(500).json({
            message: "Error updating verification document.",
            error: updateErr,
          });
        }

        // Continue only after replacement handling is complete
        const continueReview = () => {
          // Count currently approved documents
          const countApprovedSql = `
                        SELECT COUNT(*) AS approved_count
                        FROM verification_documents
                        WHERE technician_id = ?
                        AND verification_status = 'approved'
                        AND is_current = 1
                    `;

          db.query(
            countApprovedSql,
            [technicianId],
            (countErr, countResults) => {
              if (countErr) {
                console.error("Error checking approved documents:", countErr);

                return res.status(500).json({
                  message:
                    "Document reviewed, but approved document count could not be checked.",
                  error: countErr,
                });
              }

              const approvedCount = Number(
                countResults[0]?.approved_count || 0,
              );

              const verifiedValue = approvedCount > 0 ? 1 : 0;

              const updateTechnicianSql = `
                                UPDATE technician_profiles
                                SET is_verified = ?
                                WHERE technician_id = ?
                            `;

              db.query(
                updateTechnicianSql,
                [verifiedValue, technicianId],
                (technicianErr) => {
                  if (technicianErr) {
                    console.error(
                      "Error updating technician verification:",
                      technicianErr,
                    );

                    return res.status(500).json({
                      message:
                        "Document reviewed, but technician verification update failed.",
                      error: technicianErr,
                    });
                  }

                  // Create notification
                  const notificationType =
                    decision === "rejected"
                      ? "verification_rejected"
                      : "verification_approved";

                  const notificationTitle =
                    decision === "rejected"
                      ? "Verification document rejected"
                      : "Verification document approved";

                  const notificationMessage =
                    decision === "rejected"
                      ? `Your verification document was rejected. Reason: ${finalRejectionReason}`
                      : "Your verification document has been approved.";

                  const createNotificationSql = `
                                        INSERT INTO notifications
                                        (
                                            technician_id,
                                            document_id,
                                            notification_type,
                                            title,
                                            message
                                        )
                                        VALUES (?, ?, ?, ?, ?)
                                    `;

                  db.query(
                    createNotificationSql,
                    [
                      technicianId,
                      Number(documentId),
                      notificationType,
                      notificationTitle,
                      notificationMessage,
                    ],
                    (notificationErr) => {
                      if (notificationErr) {
                        console.error(
                          "Error creating notification:",
                          notificationErr,
                        );

                        return res.status(500).json({
                          message:
                            "Document reviewed successfully, but notification could not be created.",
                          error: notificationErr,
                        });
                      }

                      res.status(200).json({
                        message: `Verification document ${decision} successfully.`,
                        document_id: Number(documentId),
                        technician_id: technicianId,
                        decision,
                        rejection_reason: finalRejectionReason,
                        approved_documents: approvedCount,
                        technician_verified: verifiedValue === 1,
                      });
                    },
                  );
                },
              );
            },
          );
        };

        // Handle approved replacement
        if (replacesDocumentId && decision === "approved") {
          // Retire the previous document
          const retireOldDocumentSql = `
                        UPDATE verification_documents
                        SET is_current = 0
                        WHERE document_id = ?
                        AND technician_id = ?
                    `;

          db.query(
            retireOldDocumentSql,
            [replacesDocumentId, technicianId],
            (retireErr) => {
              if (retireErr) {
                console.error("Error retiring old document:", retireErr);

                return res.status(500).json({
                  message:
                    "Replacement approved, but the old document could not be retired.",
                  error: retireErr,
                });
              }

              // Make the approved replacement current
              const activateNewDocumentSql = `
                                UPDATE verification_documents
                                SET is_current = 1
                                WHERE document_id = ?
                                AND technician_id = ?
                            `;

              db.query(
                activateNewDocumentSql,
                [documentId, technicianId],
                (activateErr) => {
                  if (activateErr) {
                    console.error(
                      "Error activating replacement document:",
                      activateErr,
                    );

                    return res.status(500).json({
                      message:
                        "Replacement approved, but could not activate the new document.",
                      error: activateErr,
                    });
                  }

                  continueReview();
                },
              );
            },
          );
        } else {
          // Normal approval or rejected replacement
          continueReview();
        }
      },
    );
  });
};

// ======================================================
// Update My Technician Profile
// Logged-in Technician Only
// ======================================================

exports.updateMyProfile = (req, res) => {
  const user_id = req.user.user_id;

  const {
    category_id,
    bio,
    years_experience,
    location,
    employment_type,
    agency_id,
  } = req.body;

  // ---------------------------------------------
  // Validate required fields
  // ---------------------------------------------

  if (
    !category_id ||
    typeof bio !== "string" ||
    !bio.trim() ||
    years_experience === undefined ||
    years_experience === null ||
    typeof location !== "string" ||
    !location.trim() ||
    !employment_type
  ) {
    return res.status(400).json({
      message: "Please provide all required profile fields.",
    });
  }

  // ---------------------------------------------
  // Validate category and experience
  // ---------------------------------------------

  if (
    !Number.isInteger(Number(category_id)) ||
    Number(category_id) <= 0 ||
    !Number.isFinite(Number(years_experience)) ||
    Number(years_experience) < 0
  ) {
    return res.status(400).json({
      message: "Please provide a valid category and years of experience.",
    });
  }

  // ---------------------------------------------
  // Validate employment type
  // ---------------------------------------------

  if (!["Independent", "Agency"].includes(employment_type)) {
    return res.status(400).json({
      message: "Employment type must be Independent or Agency.",
    });
  }

  // ---------------------------------------------
  // Validate agency selection
  // ---------------------------------------------

  if (
    employment_type === "Agency" &&
    (!agency_id ||
      !Number.isInteger(Number(agency_id)) ||
      Number(agency_id) <= 0)
  ) {
    return res.status(400).json({
      message: "Please select a valid agency.",
    });
  }

  // ---------------------------------------------
  // Check whether the technician profile exists
  // IMPORTANT: Do this before the UPDATE.
  // ---------------------------------------------

  const checkProfileSql = `
        SELECT technician_id
        FROM technician_profiles
        WHERE user_id = ?
    `;

  db.query(checkProfileSql, [user_id], (profileErr, profileResults) => {
    if (profileErr) {
      console.error("Profile existence check error:", profileErr);

      return res.status(500).json({
        message: "Error checking technician profile.",
      });
    }

    if (profileResults.length === 0) {
      return res.status(404).json({
        message:
          "Technician profile not found. Please create your profile first.",
      });
    }

    // -----------------------------------------
    // Validate category exists
    // -----------------------------------------

    const categorySql = `
                SELECT category_id
                FROM categories
                WHERE category_id = ?
      `;

    db.query(
      categorySql,
      [Number(category_id)],
      (categoryErr, categoryResults) => {
        if (categoryErr) {
          console.error("Category validation error:", categoryErr);

          return res.status(500).json({
            message: "Error validating technician category.",
          });
        }

        if (categoryResults.length === 0) {
          return res.status(400).json({
            message: "The selected category does not exist.",
          });
        }

        // ---------------------------------
        // Perform the profile update
        // ---------------------------------

        const updateProfile = () => {
          const updateSql = `
                            UPDATE technician_profiles
                            SET
                                category_id = ?,
                                bio = ?,
                                years_experience = ?,
                                location = ?,
                                employment_type = ?,
                                agency_id = ?
                            WHERE user_id = ?
                        `;

          const values = [
            Number(category_id),
            bio.trim(),
            Number(years_experience),
            location.trim(),
            employment_type,
            employment_type === "Agency" ? Number(agency_id) : null,
            user_id,
          ];

          db.query(updateSql, values, (updateErr, result) => {
            if (updateErr) {
              console.error("Profile update error:", updateErr);

              return res.status(500).json({
                message: "Error updating technician profile.",
              });
            }

            // Do not use affectedRows === 0
            // to determine profile existence.
            // The profile was checked above.

            return res.status(200).json({
              message: "Professional profile updated successfully.",
              technician_id: profileResults[0].technician_id,
            });
          });
        };

        // ---------------------------------
        // Independent technician
        // ---------------------------------

        if (employment_type === "Independent") {
          return updateProfile();
        }

        // ---------------------------------
        // Validate selected agency
        // ---------------------------------

        const agencySql = `
                        SELECT agency_id
                        FROM agency_profiles
                        WHERE agency_id = ?
                    `;

        db.query(agencySql, [Number(agency_id)], (agencyErr, agencyResults) => {
          if (agencyErr) {
            console.error("Agency validation error:", agencyErr);

            return res.status(500).json({
              message: "Error validating selected agency.",
            });
          }

          if (agencyResults.length === 0) {
            return res.status(400).json({
              message: "The selected agency does not exist.",
            });
          }

          updateProfile();
        });
      },
    );
  });
};

// ======================================================
// Admin: Retrieve Verification Document from Supabase
// ======================================================

exports.getVerificationDocumentFile = (req, res) => {
  const documentId = Number(req.params.documentId);

  if (!Number.isInteger(documentId) || documentId <= 0) {
    return res.status(400).json({
      message: "Invalid verification document ID.",
    });
  }

  const sql = `
    SELECT document_path
    FROM verification_documents
    WHERE document_id = ?
  `;

  db.query(sql, [documentId], async (err, results) => {
    if (err) {
      console.error("Error retrieving document path:", err);

      return res.status(500).json({
        message: "Unable to retrieve verification document.",
      });
    }

    if (!results.length || !results[0].document_path) {
      return res.status(404).json({
        message: "Verification document not found.",
      });
    }

    const filePath = results[0].document_path;

    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(filePath);

      if (error || !data) {
        console.error("Supabase document download error:", error);

        return res.status(404).json({
          message: "Verification document file not found in storage.",
        });
      }

      const fileBuffer = Buffer.from(await data.arrayBuffer());

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("Cache-Control", "private, no-store");

      return res.send(fileBuffer);
    } catch (downloadError) {
      console.error("Document download error:", downloadError);

      return res.status(500).json({
        message: "Error downloading verification document.",
      });
    }
  });
};

// ======================================================
// Admin: Retrieve Verification Selfie from Supabase
// ======================================================

exports.getVerificationSelfieFile = (req, res) => {
  const documentId = Number(req.params.documentId);

  if (!Number.isInteger(documentId) || documentId <= 0) {
    return res.status(400).json({
      message: "Invalid verification document ID.",
    });
  }

  const sql = `
    SELECT selfie_path
    FROM verification_documents
    WHERE document_id = ?
  `;

  db.query(sql, [documentId], async (err, results) => {
    if (err) {
      console.error("Error retrieving selfie path:", err);

      return res.status(500).json({
        message: "Unable to retrieve verification selfie.",
      });
    }

    if (!results.length || !results[0].selfie_path) {
      return res.status(404).json({
        message: "Verification selfie not found.",
      });
    }

    const filePath = results[0].selfie_path;

    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(filePath);

      if (error || !data) {
        console.error("Supabase selfie download error:", error);

        return res.status(404).json({
          message: "Verification selfie file not found in storage.",
        });
      }

      const fileBuffer = Buffer.from(await data.arrayBuffer());

      // Determine the selfie MIME type from its stored extension.
      const extension = path.extname(filePath).toLowerCase();

      const mimeTypes = {
        ".webp": "image/webp",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
      };

      const contentType = mimeTypes[extension] || "application/octet-stream";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("Cache-Control", "private, no-store");

      return res.send(fileBuffer);
    } catch (downloadError) {
      console.error("Selfie download error:", downloadError);

      return res.status(500).json({
        message: "Error downloading verification selfie.",
      });
    }
  });
};
