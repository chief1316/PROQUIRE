const db = require("../config/db");
const fs = require("fs");
const { analyzeDocument } = require("../services/geminiService");

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

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Error fetching technician profile:", err);

      return res.status(500).json({
        message: "Error fetching your technician profile",
        error: err,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Technician profile not found",
      });
    }

    res.status(200).json(results[0]);
  });
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

exports.uploadVerificationDocument = (req, res) => {
  const documentFile = req.files?.document?.[0];
  const selfieFile = req.files?.selfie?.[0];
  if (req.user.role !== "technician") {
    return res.status(403).json({
      message: "Only technician accounts can upload verification documents.",
    });
  }

  const { technician_id, document_type, replaces_document_id } = req.body;

  // ---------------------------------------------
  // Check that a file was uploaded
  // ---------------------------------------------

  if (!documentFile) {
    return res.status(400).json({
      message: "Please upload a verification document.",
    });
  }

  // National ID submissions must include a selfie
  if (document_type === "National ID" && !selfieFile) {
    try {
      fs.unlinkSync(documentFile.path);
    } catch (error) {
      console.log("Could not delete uploaded document:", error);
    }

    return res.status(400).json({
      message: "Please upload a selfie holding your National ID.",
    });
  }

  // ---------------------------------------------
  // Check required fields
  // ---------------------------------------------

  if (!technician_id || !document_type) {
    try {
      fs.unlinkSync(documentFile.path);

      if (selfieFile) {
        fs.unlinkSync(selfieFile.path);
      }
    } catch (error) {
      console.log("Could not delete uploaded file:", error);
    }

    return res.status(400).json({
      message: "technician_id and document_type are required.",
    });
  }

  // ---------------------------------------------
  // Verify technician ownership
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

  db.query(
    ownershipSql,
    [
      replaces_document_id || null,
      document_type,
      technician_id,
      req.user.user_id,
    ],
    async (err, results) => {
      if (err) {
        try {
          fs.unlinkSync(documentFile.path);

          if (selfieFile) {
            fs.unlinkSync(selfieFile.path);
          }
        } catch (error) {
          console.log("Could not delete uploaded files:", error);
        }

        return res.status(500).json({
          message: "Error checking technician ownership.",
          error: err,
        });
      }

      // -----------------------------------------
      // Technician does not belong to user
      // -----------------------------------------

      if (results.length === 0) {
        try {
          fs.unlinkSync(documentFile.path);

          if (selfieFile) {
            fs.unlinkSync(selfieFile.path);
          }
        } catch (error) {
          console.log("Could not delete uploaded files:", error);
        }

        return res.status(403).json({
          message:
            "You can only upload documents for your own technician profile.",
        });
      }

      // ---------------------------------------------
      // Validate replacement document
      // ---------------------------------------------

      if (replaces_document_id && !results[0].replacement_document_id) {
        return res.status(400).json({
          message: "The document you selected cannot be replaced.",
        });
      }

      // -----------------------------------------
      // Create database path
      // -----------------------------------------

      const document_path = `uploads/documents/${documentFile.filename}`;

      const selfie_path = selfieFile
        ? `uploads/verification_selfies/${selfieFile.filename}`
        : null;

      // -----------------------------------------
      // Save document information
      // -----------------------------------------

      const sql = `
    INSERT INTO verification_documents
    (
        technician_id,
        document_type,
        document_path,
        selfie_path,
        replaces_document_id,
        is_current
    )
    VALUES (?, ?, ?, ?, ?, ?)
`;

      db.query(
        sql,
        [
          technician_id,
          document_type,
          document_path,
          selfie_path,
          replaces_document_id || null,
          replaces_document_id ? 0 : 1,
        ],
        async (err, result) => {
          if (err) {
            try {
              if (documentFile && fs.existsSync(documentFile.path)) {
                fs.unlinkSync(documentFile.path);
              }

              if (selfieFile && fs.existsSync(selfieFile.path)) {
                fs.unlinkSync(selfieFile.path);
              }
            } catch (error) {
              console.log("Could not delete uploaded file:", error);
            }

            return res.status(500).json({
              message: "Error saving verification document.",
              error: err,
            });
          }

          // -----------------------------------------
          // Document successfully saved
          // -----------------------------------------

          const document_id = result.insertId;

          // -----------------------------------------
          // Run Gemini AI analysis
          // -----------------------------------------

          console.log("Starting Gemini AI verification...");

          let aiResult;

          try {
            aiResult = await analyzeDocument(
              documentFile.path,
              documentFile.mimetype,
            );

            console.log("Gemini AI verification completed.");
          } catch (aiError) {
            console.error("Gemini AI verification failed:", aiError.message);

            return res.status(201).json({
              message:
                "Verification document uploaded, but AI analysis failed.",

              document: {
                document_id: document_id,
                technician_id: Number(technician_id),
                document_type: document_type,
                document_path: document_path,
                selfie_path: selfie_path,
                selfie_url: selfie_path
                  ? `http://localhost:5000/${selfie_path}`
                  : null,
                verification_status: "pending",

                file_url: `http://localhost:5000/uploads/${document_path}`,
              },

              ai_verification: {
                status: "failed",
                message:
                  "AI analysis could not be completed. Admin review is required.",
              },
            });
          }

          // -----------------------------------------
          // Save Gemini result
          // -----------------------------------------

          const aiSql = `
                        INSERT INTO ai_verifications
                        (
                            document_id,
                            confidence_score,
                            verification_result,
                            verified_by,
                            remarks
                        )
                        VALUES (?, ?, ?, ?, ?)
                    `;

          db.query(
            aiSql,
            [
              document_id,
              aiResult.confidence_score,
              aiResult.verification_result,
              "Gemini AI",
              aiResult.remarks,
            ],
            (aiErr, aiInsertResult) => {
              if (aiErr) {
                console.error("AI result database error:", aiErr);

                return res.status(500).json({
                  message:
                    "Document uploaded and AI analyzed it, but AI result could not be saved.",
                  error: aiErr,
                });
              }

              // -----------------------------------------
              // Final response
              // -----------------------------------------

              res.status(201).json({
                message:
                  "Verification document uploaded and analyzed successfully.",

                document: {
                  document_id: document_id,

                  technician_id: Number(technician_id),

                  document_type: document_type,

                  document_path: document_path,

                  selfie_path: selfie_path,

                  selfie_url: selfie_path
                    ? `http://localhost:5000/${selfie_path}`
                    : null,

                  verification_status: "pending",

                  file_url: `http://localhost:5000/${document_path}`,
                },

                ai_verification: {
                  verification_id: aiInsertResult.insertId,

                  verification_result: aiResult.verification_result,

                  confidence_score: aiResult.confidence_score,

                  document_type: aiResult.document_type,

                  remarks: aiResult.remarks,
                },
              });
            },
          );
        },
      );
    },
  );
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
