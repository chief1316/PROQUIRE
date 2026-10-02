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
import axios from "axios";

import "./TechnicianVerification.css";

const API = "http://localhost:5000/api";

function TechnicianVerification() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [technicianProfile, setTechnicianProfile] = useState(null);

  const [loadingProfile, setLoadingProfile] = useState(true);

  const [documentType, setDocumentType] = useState("");

  const [selectedDocument, setSelectedDocument] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [aiResult, setAiResult] = useState(null);

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

        const response = await axios.get(`${API}/technicians/my-profile`, {
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

      const response = await axios.post(
        `${API}/technicians/verification/upload`,
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

        <form className="verification-form-card" onSubmit={handleSubmit}>
          <div className="verification-form-header">
            <div>
              <span className="verification-section-label">
                DOCUMENT SUBMISSION
              </span>

              <h2>Upload a verification document</h2>

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
