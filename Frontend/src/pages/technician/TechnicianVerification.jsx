import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  FileCheck2,
  FileText,
  ShieldCheck,
  Upload,
} from "lucide-react";
import api from "../api";

import "./TechnicianVerification.css";

const API = "https://proquire.onrender.com/api";

function TechnicianVerification() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const selfieInputRef = useRef(null);
  const uploadFormRef = useRef(null);

  const [selectedSelfie, setSelectedSelfie] = useState(null);

  const [selfiePreview, setSelfiePreview] = useState("");

  const [technicianProfile, setTechnicianProfile] = useState(null);

  const [loadingProfile, setLoadingProfile] = useState(true);

  const [documentType, setDocumentType] = useState("");

  const [selectedDocument, setSelectedDocument] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [aiResult, setAiResult] = useState(null);

  const [verificationDocuments, setVerificationDocuments] = useState([]);

  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const [replacingDocumentId, setReplacingDocumentId] = useState(null);

  /* =====================================================
     GET LOGGED-IN TECHNICIAN PROFILE
  ===================================================== */

  useEffect(() => {
    const loadProfile = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");

        return;
      }

      try {
        setLoadingProfile(true);
        setError("");

        const response = await api.get(`/technicians/my-profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTechnicianProfile(response.data);
      } catch (err) {
        console.error("Error loading technician profile:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");

          navigate("/login");

          return;
        }

        setError(
          err.response?.data?.message ||
            "Unable to load your technician profile.",
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [navigate]);

  /* =====================================================
     GET MY VERIFICATION DOCUMENTS
  ===================================================== */

  useEffect(() => {
    const loadVerificationDocuments = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) return;

      try {
        setLoadingDocuments(true);

        const response = await api.get(
          `/technicians/my-verification-documents`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setVerificationDocuments(response.data || []);
      } catch (err) {
        console.error("Error loading verification documents:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load your verification documents.",
        );
      } finally {
        setLoadingDocuments(false);
      }
    };

    loadVerificationDocuments();
  }, []);

  /* =====================================================
     FILE SELECTION
  ===================================================== */

  const handleDocumentChange = (event) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase();

    const isPdf =
      selectedFile.type === "application/pdf" && fileExtension === "pdf";

    if (!isPdf) {
      setSelectedDocument(null);
      setError("Only PDF documents are accepted. Please select a PDF file.");
      setSuccess("");
      setAiResult(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      window.alert(
        "Invalid document format.\n\nOnly PDF files are accepted for verification.",
      );

      return;
    }

    setSelectedDocument(selectedFile);

    setError("");
    setSuccess("");
    setAiResult(null);
  };

  /* =====================================================
   SELFIE SELECTION
===================================================== */

  const handleSelfieChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a JPG, PNG or WEBP selfie.");
      setSelectedSelfie(null);
      setSelfiePreview("");
      event.target.value = "";
      return;
    }

    setSelectedSelfie(file);
    setSelfiePreview(URL.createObjectURL(file));

    setError("");
    setSuccess("");
  };

  /* =====================================================
     SUBMIT DOCUMENT
  ===================================================== */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setAiResult(null);

    if (!technicianProfile?.technician_id) {
      setError("Technician profile could not be identified.");

      return;
    }

    if (!documentType) {
      setError("Please select a document type.");

      return;
    }

    if (!selectedDocument) {
      setError("Please select a document to upload.");

      return;
    }

    if (selectedDocument.type !== "application/pdf") {
      const message = "Invalid document format. Please upload a PDF file only.";

      setError(message);

      window.alert(message);

      setSelectedDocument(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    if (documentType === "National ID" && !selectedSelfie) {
      setError("Please upload a selfie holding your National ID.");
      return;
    }

    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
      navigate("/login");

      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("technician_id", technicianProfile.technician_id);

      formData.append("document_type", documentType);

      formData.append("document", selectedDocument);
      if (replacingDocumentId) {
        formData.append("replaces_document_id", replacingDocumentId);
      }
      if (selectedSelfie) {
        formData.append("selfie", selectedSelfie);
      }

      const response = await api.post(
        `/technicians/verification/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setSuccess(
        response.data?.message ||
          "Verification document submitted successfully.",
      );

      if (response.data?.ai_verification) {
        setAiResult(response.data.ai_verification);
      }

      setSelectedDocument(null);
      setDocumentType("");

      setReplacingDocumentId(null);

      setSelectedSelfie(null);
      setSelfiePreview("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (selfieInputRef.current) {
        selfieInputRef.current.value = "";
      }

      // Refresh verification document history
      const documentsResponse = await api.get(
        `/technicians/my-verification-documents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setVerificationDocuments(documentsResponse.data || []);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Verification upload error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        navigate("/login");

        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to submit your verification document. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loadingProfile) {
    return (
      <div className="technician-verification-page">
        <div className="verification-loading-card">
          <p>Loading your verification page...</p>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="technician-verification-page">
      <div className="technician-verification-container">
        {/* BACK BUTTON */}

        <button
          type="button"
          className="verification-back-button"
          onClick={() => navigate("/technician")}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        {/* HEADER */}

        <div className="verification-page-header">
          <div className="verification-header-icon">
            <ShieldCheck size={30} />
          </div>

          <div>
            <span className="verification-eyebrow">
              PROFESSIONAL VERIFICATION
            </span>

            <h1>Submit Verification Documents</h1>

            <p>
              Submit your professional documents for AI analysis and
              administrator verification.
            </p>
          </div>
        </div>

        {/* PROFILE INFORMATION */}

        <div className="verification-profile-card">
          <div className="verification-profile-icon">
            <FileCheck2 size={22} />
          </div>

          <div>
            <span>Technician Profile</span>

            <strong>{technicianProfile?.full_name || "Technician"}</strong>

            <small>Technician ID: {technicianProfile?.technician_id}</small>
          </div>
        </div>

        {/* EXISTING VERIFICATION DOCUMENTS */}

        <div className="verification-form-card">
          <div className="verification-form-header">
            <div>
              <span className="verification-section-label">
                YOUR SUBMISSIONS
              </span>

              <h2>My Verification Documents</h2>

              <p>
                View the documents you have previously submitted and their
                current review status.
              </p>
            </div>
          </div>

          {loadingDocuments ? (
            <p>Loading your verification documents...</p>
          ) : verificationDocuments.length === 0 ? (
            <p>You have not submitted any verification documents yet.</p>
          ) : (
            verificationDocuments.map((document) => (
              <div
                key={document.document_id}
                className="verification-profile-card"
              >
                <div className="verification-profile-icon">
                  <FileCheck2 size={22} />
                </div>

                <div>
                  <strong>{document.document_type}</strong>

                  <small>
                    Submitted:{" "}
                    {new Date(document.uploaded_at).toLocaleDateString()}
                  </small>

                  <small>
                    Status: {document.verification_status?.toUpperCase()}
                  </small>

                  {document.rejection_reason && (
                    <small>Rejection reason: {document.rejection_reason}</small>
                  )}
                </div>
                {document.verification_status === "approved" &&
                  Number(document.is_current) === 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setReplacingDocumentId(document.document_id);
                        setDocumentType(document.document_type);
                        setSelectedDocument(null);
                        setSelectedSelfie(null);
                        setSelfiePreview("");

                        uploadFormRef.current?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }}
                    >
                      Replace Document
                    </button>
                  )}
              </div>
            ))
          )}
        </div>

        {/* INFORMATION */}

        <div className="verification-info-card">
          <ShieldCheck size={21} />

          <div>
            <strong>How verification works</strong>

            <p>
              Your document will first be analyzed by our AI verification
              system. The result will then be available to an administrator for
              final review.
            </p>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="verification-message verification-error">{error}</div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="verification-message verification-success">
            <CheckCircle size={20} />

            <span>{success}</span>
          </div>
        )}

        {/* AI RESULT */}

        {aiResult && (
          <div className="verification-ai-card">
            <div className="verification-ai-header">
              <FileCheck2 size={22} />

              <div>
                <h2>AI Verification Result</h2>

                <p>
                  Your document has been analyzed and is awaiting administrator
                  review.
                </p>
              </div>
            </div>

            <div className="verification-ai-details">
              {aiResult.verification_result && (
                <div>
                  <span>Result</span>

                  <strong>{aiResult.verification_result}</strong>
                </div>
              )}

              {aiResult.confidence_score !== undefined && (
                <div>
                  <span>Confidence Score</span>

                  <strong>{aiResult.confidence_score}</strong>
                </div>
              )}

              {aiResult.document_type && (
                <div>
                  <span>Document Type</span>

                  <strong>{aiResult.document_type}</strong>
                </div>
              )}
            </div>

            {aiResult.remarks && (
              <div className="verification-ai-remarks">
                <span>AI Remarks</span>

                <p>{aiResult.remarks}</p>
              </div>
            )}
          </div>
        )}

        {/* UPLOAD FORM */}

        <form
          ref={uploadFormRef}
          className="verification-form-card"
          onSubmit={handleSubmit}
        >
          <div className="verification-form-header">
            <div>
              <span className="verification-section-label">
                DOCUMENT SUBMISSION
              </span>

              <h2>
                {replacingDocumentId
                  ? `Replace ${documentType}`
                  : "Upload a verification document"}
              </h2>

              <p>
                Select the type of document you are submitting and upload a
                clear copy.
              </p>
            </div>
          </div>

          {/* DOCUMENT TYPE */}

          <div className="verification-field">
            <label htmlFor="document-type">Document Type</label>

            <select
              id="document-type"
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
              disabled={submitting}
            >
              <option value="">Select document type</option>

              <option value="National ID">National ID</option>

              <option value="Professional Certificate">
                Professional Certificate
              </option>

              <option value="Training Certificate">Training Certificate</option>

              <option value="License">Professional License</option>

              <option value="Other">Other</option>
            </select>
          </div>

          {/* FILE */}

          <div className="verification-field">
            <label htmlFor="verification-document">Verification Document</label>

            <label
              htmlFor="verification-document"
              className="verification-upload-area"
            >
              <Upload size={28} />

              <strong>
                {selectedDocument ? selectedDocument.name : "Choose a document"}
              </strong>

              <span>PDF files only</span>

              {selectedDocument && (
                <small>Selected file: {selectedDocument.name}</small>
              )}
            </label>

            <input
              ref={fileInputRef}
              id="verification-document"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
              onChange={handleDocumentChange}
              disabled={submitting}
            />
          </div>

          {/* SELFIE WITH NATIONAL ID */}

          <div className="verification-field">
            <label htmlFor="verification-selfie">
              Selfie Holding Your National ID
            </label>

            <p>
              Take a clear photo of yourself holding your National ID beside
              your face. Make sure your face and ID photograph are visible.
            </p>

            <label
              htmlFor="verification-selfie"
              className="verification-upload-area"
            >
              <Upload size={28} />

              <strong>
                {selectedSelfie ? selectedSelfie.name : "Choose your selfie"}
              </strong>

              <span>JPG, PNG or WEBP files only</span>
            </label>

            <input
              ref={selfieInputRef}
              id="verification-selfie"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="user"
              onChange={handleSelfieChange}
              disabled={submitting}
            />

            {selfiePreview && (
              <div className="verification-selfie-preview">
                <img
                  src={selfiePreview}
                  alt="Preview of selfie holding National ID"
                />

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSelfie(null);
                    setSelfiePreview("");

                    if (selfieInputRef.current) {
                      selfieInputRef.current.value = "";
                    }
                  }}
                >
                  Remove selfie
                </button>
              </div>
            )}
          </div>

          {/* SUBMIT */}

          <div className="verification-form-actions">
            <button
              type="button"
              className="verification-cancel-button"
              onClick={() => navigate("/technician")}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="verification-submit-button"
              disabled={submitting}
            >
              <FileText size={18} />

              {submitting ? "Submitting..." : "Submit for Verification"}
            </button>
          </div>
        </form>

        {/* PROCESS */}

        <div className="verification-process-card">
          <h2>Verification Process</h2>

          <div className="verification-process-steps">
            <div className="verification-process-step">
              <span>1</span>

              <div>
                <strong>Document Submission</strong>

                <p>Upload your verification document.</p>
              </div>
            </div>

            <div className="verification-process-step">
              <span>2</span>

              <div>
                <strong>AI Analysis</strong>

                <p>The document is analyzed automatically.</p>
              </div>
            </div>

            <div className="verification-process-step">
              <span>3</span>

              <div>
                <strong>Administrator Review</strong>

                <p>An administrator makes the final verification decision.</p>
              </div>
            </div>

            <div className="verification-process-step">
              <span>4</span>

              <div>
                <strong>Profile Verification</strong>

                <p>Your profile is updated after the final decision.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TechnicianVerification;
