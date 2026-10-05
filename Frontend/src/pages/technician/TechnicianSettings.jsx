import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  User,
  Mail,
  Phone,
  Shield,
  AlertTriangle,
  Trash2,
  X,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const TechnicianSettings = () => {
  const navigate = useNavigate();

  const token = sessionStorage.getItem("token");

  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const [fullName, setFullName] = useState(user.full_name || user.name || "");

  const [email] = useState(user.email || "");

  const [phone, setPhone] = useState(user.phone || "");

  const [profilePhoto, setProfilePhoto] = useState(null);

  const [profilePreview, setProfilePreview] = useState(
    user.profile_photo ? user.profile_photo : "",
  );

  const [profileLoading, setProfileLoading] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");

  const [profileError, setProfileError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  const [deleteAccountError, setDeleteAccountError] = useState("");

  const [deleteConfirmed, setDeleteConfirmed] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  /*
   * =========================================================
   * Load the latest account information
   * =========================================================
   */

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await axios.get(`${API}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const currentUser = response.data?.user || response.data;

        if (!currentUser) {
          return;
        }

        setFullName(currentUser.full_name || currentUser.name || "");

        setPhone(currentUser.phone || "");

        if (currentUser.profile_photo) {
          setProfilePreview(currentUser.profile_photo);
        }

        /*
         * Keep sessionStorage user information
         * synchronized with the latest profile data.
         */
        sessionStorage.setItem("user", JSON.stringify(currentUser));
      } catch (error) {
        console.error("Error loading technician profile:", error);
      }
    };

    loadProfile();
  }, [token]);

  /*
   * =========================================================
   * Profile photo selection
   * =========================================================
   */

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setProfilePhoto(file);

    setProfileError("");
    setProfileMessage("");

    const previewUrl = URL.createObjectURL(file);

    setProfilePreview(previewUrl);
  };

  /*
   * =========================================================
   * Update profile
   * =========================================================
   */

  const handleProfileUpdate = async (event) => {
    event.preventDefault();

    if (!token) {
      setProfileError("Your session has expired. Please log in again.");

      return;
    }

    try {
      setProfileLoading(true);
      setProfileMessage("");
      setProfileError("");

      const formData = new FormData();

      formData.append("full_name", fullName);

      formData.append("phone", phone);

      if (profilePhoto) {
        formData.append("profile_photo", profilePhoto);
      }

      const response = await axios.put(`${API}/users/me`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      /*
       * Update the saved user information so
       * the dashboard immediately reflects changes.
       */
      try {
        const savedUser = JSON.parse(sessionStorage.getItem("user")) || {};

        const updatedUser = {
          ...savedUser,
          full_name: fullName,
          name: fullName,
          phone: phone,
        };

        if (response.data?.user?.profile_photo) {
          updatedUser.profile_photo = response.data.user.profile_photo;
        }

        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      } catch {
        // Keep the successful API update unaffected.
      }

      setProfilePhoto(null);

      setProfileMessage(
        response.data?.message || "Profile updated successfully.",
      );
    } catch (error) {
      console.error("Profile update error:", error);

      setProfileError(
        error?.response?.data?.message ||
          "Unable to update your profile. Please try again.",
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!token) {
      setPasswordError("Your session has expired. Please log in again.");
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation password do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "Your new password must be different from your current password.",
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await axios.put(
        `${API}/users/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPasswordMessage(
        response.data?.message || "Password changed successfully.",
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change password error:", error);

      setPasswordError(
        error?.response?.data?.message ||
          "Unable to change your password. Please try again.",
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  /*
   * =========================================================
   * Delete account
   * =========================================================
   */

  const handleDeleteAccount = async () => {
    if (!token) {
      setDeleteAccountError("Your session has expired. Please log in again.");

      return;
    }

    if (!deleteConfirmed) {
      setDeleteAccountError(
        "Please confirm that you understand this action is permanent.",
      );

      return;
    }

    try {
      setDeleteAccountLoading(true);
      setDeleteAccountError("");

      await axios.delete(`${API}/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Account deletion error:", error);

      setDeleteAccountError(
        error?.response?.data?.message ||
          "Unable to delete your account. Please try again.",
      );
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  const closeDeleteModal = () => {
    if (deleteAccountLoading) {
      return;
    }

    setShowDeleteModal(false);
    setDeleteConfirmed(false);
    setDeleteAccountError("");
  };

  return (
    <div style={styles.page}>
      {/* =====================================================
                PAGE HEADER
            ====================================================== */}

      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <Settings size={24} />
        </div>

        <div>
          <h1 style={styles.title}>Settings</h1>

          <p style={styles.subtitle}>
            Manage your profile, contact information, security and account
            settings.
          </p>
        </div>
      </div>

      {/* =====================================================
                PROFILE & CONTACT INFORMATION
            ====================================================== */}

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <User size={20} />
          </div>

          <div>
            <h2 style={styles.sectionTitle}>Profile & Contact Information</h2>

            <p style={styles.sectionDescription}>
              Update your name, phone number and profile photo.
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate}>
          {/* Profile Photo */}

          <div style={styles.photoSection}>
            <div style={styles.photoWrapper}>
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile"
                  style={styles.profilePhoto}
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div style={styles.photoPlaceholder}>
                  <User size={34} />
                </div>
              )}

              <label
                htmlFor="technician-profile-photo"
                style={styles.cameraButton}
                title="Change profile photo"
              >
                <Camera size={16} />

                <input
                  id="technician-profile-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={styles.hiddenInput}
                />
              </label>
            </div>

            <div>
              <h3 style={styles.photoTitle}>Profile Photo</h3>

              <p style={styles.photoDescription}>
                Choose a professional photo that clients can use to recognize
                you.
              </p>

              <label
                htmlFor="technician-profile-photo"
                style={styles.changePhotoButton}
              >
                <Camera size={16} />
                Change Photo
              </label>
            </div>
          </div>

          {/* Name */}

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Name</label>

              <div style={styles.inputWrapper}>
                <User size={17} style={styles.inputIcon} />

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  style={styles.input}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Email */}

            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>

              <div
                style={{
                  ...styles.inputWrapper,
                  ...styles.disabledInputWrapper,
                }}
              >
                <Mail size={17} style={styles.inputIcon} />

                <input
                  type="email"
                  value={email}
                  disabled
                  style={{
                    ...styles.input,
                    ...styles.disabledInput,
                  }}
                />
              </div>

              <span style={styles.helperText}>
                Email changes will be handled through the account verification
                process.
              </span>
            </div>

            {/* Phone */}

            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>

              <div style={styles.inputWrapper}>
                <Phone size={17} style={styles.inputIcon} />

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                    setPhone(value);
                  }}
                  maxLength={10}
                  pattern="^(07|01)[0-9]{8}$"
                />
              </div>
            </div>
          </div>

          {/* Messages */}

          {profileMessage && (
            <div style={styles.successMessage}>
              <CheckCircle size={17} />

              {profileMessage}
            </div>
          )}

          {profileError && (
            <div style={styles.errorMessage}>{profileError}</div>
          )}

          {/* Save */}

          <div style={styles.formActions}>
            <button
              type="submit"
              style={{
                ...styles.saveButton,
                ...(profileLoading ? styles.disabledButton : {}),
              }}
              disabled={profileLoading}
            >
              {profileLoading ? (
                <>
                  <Loader2 size={17} style={styles.spinner} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* =====================================================
          SECURITY
      ====================================================== */}

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>
            <Shield size={20} />
          </div>

          <div>
            <h2 style={styles.sectionTitle}>Security</h2>

            <p style={styles.sectionDescription}>
              Change your password to keep your technician account secure.
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword}>
          <div style={styles.passwordGrid}>
            {/* Current Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Current Password</label>

              <div style={styles.inputWrapper}>
                <Shield size={17} style={styles.inputIcon} />

                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(event) => {
                    setCurrentPassword(event.target.value);
                    setPasswordError("");
                    setPasswordMessage("");
                  }}
                  style={styles.input}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() =>
                    setShowCurrentPassword((previous) => !previous)
                  }
                  aria-label={
                    showCurrentPassword
                      ? "Hide current password"
                      : "Show current password"
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>

              <div style={styles.inputWrapper}>
                <Shield size={17} style={styles.inputIcon} />

                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value);
                    setPasswordError("");
                    setPasswordMessage("");
                  }}
                  style={styles.input}
                  placeholder="Enter your new password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() => setShowNewPassword((previous) => !previous)}
                  aria-label={
                    showNewPassword ? "Hide new password" : "Show new password"
                  }
                >
                  {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm New Password</label>

              <div style={styles.inputWrapper}>
                <Shield size={17} style={styles.inputIcon} />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setPasswordError("");
                    setPasswordMessage("");
                  }}
                  style={styles.input}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  style={styles.passwordToggle}
                  onClick={() =>
                    setShowConfirmPassword((previous) => !previous)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password confirmation"
                      : "Show password confirmation"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>
          </div>

          {passwordMessage && (
            <div style={styles.successMessage}>
              <CheckCircle size={17} />
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div style={styles.errorMessage}>{passwordError}</div>
          )}

          <div style={styles.passwordRequirements}>
            <Shield size={16} />

            <span>
              Use a strong password that you do not use on other accounts.
            </span>
          </div>

          <div style={styles.formActions}>
            <button
              type="submit"
              style={{
                ...styles.saveButton,
                ...(passwordLoading ? styles.disabledButton : {}),
              }}
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <>
                  <Loader2 size={17} style={styles.spinner} />
                  Changing Password...
                </>
              ) : (
                <>
                  <Shield size={17} />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* =====================================================
                DANGER ZONE
            ====================================================== */}

      <section style={styles.dangerCard}>
        <div style={styles.sectionHeader}>
          <div style={styles.dangerIcon}>
            <AlertTriangle size={20} />
          </div>

          <div>
            <h2 style={styles.dangerTitle}>Danger Zone</h2>

            <p style={styles.sectionDescription}>
              Permanently remove your ProQuire account.
            </p>
          </div>
        </div>

        <div style={styles.dangerContent}>
          <div>
            <h3 style={styles.deleteTitle}>Delete Account</h3>

            <p style={styles.deleteDescription}>
              Permanently delete your technician account and associated account
              data. This action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            style={styles.deleteButton}
            onClick={() => {
              setDeleteAccountError("");
              setDeleteConfirmed(false);
              setShowDeleteModal(true);
            }}
          >
            <Trash2 size={18} />
            Delete Account
          </button>
        </div>
      </section>

      {/* =====================================================
                DELETE CONFIRMATION MODAL
            ====================================================== */}

      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <button
              type="button"
              style={styles.closeButton}
              onClick={closeDeleteModal}
              disabled={deleteAccountLoading}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div style={styles.modalIcon}>
              <AlertTriangle size={28} />
            </div>

            <h2 style={styles.modalTitle}>Delete your account?</h2>

            <p style={styles.modalText}>
              This will permanently delete your ProQuire technician account and
              its associated data.
            </p>

            <div style={styles.warningBox}>
              <AlertTriangle size={20} />

              <div>
                <strong>This action cannot be undone.</strong>

                <p style={styles.warningText}>
                  Your account information, technician profile, portfolio,
                  documents, reviews and related account data will be removed.
                </p>
              </div>
            </div>

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={deleteConfirmed}
                onChange={(event) => {
                  setDeleteConfirmed(event.target.checked);

                  setDeleteAccountError("");
                }}
                disabled={deleteAccountLoading}
                style={styles.checkbox}
              />

              <span>
                I understand that this action is permanent and cannot be undone.
              </span>
            </label>

            {deleteAccountError && (
              <div style={styles.errorMessage}>{deleteAccountError}</div>
            )}

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={closeDeleteModal}
                disabled={deleteAccountLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                style={{
                  ...styles.confirmDeleteButton,
                  ...(deleteAccountLoading || !deleteConfirmed
                    ? styles.disabledButton
                    : {}),
                }}
                onClick={handleDeleteAccount}
                disabled={deleteAccountLoading || !deleteConfirmed}
              >
                {deleteAccountLoading ? (
                  <>
                    <Loader2 size={18} style={styles.spinner} />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    Permanently Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: {
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "32px",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "28px",
  },

  headerIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    background: "#eef2ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    margin: "5px 0 0",
    fontSize: "14px",
    color: "#6b7280",
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "22px",
  },

  sectionIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#f3f4f6",
    color: "#4b5563",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
  },

  sectionDescription: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#6b7280",
  },

  photoSection: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    paddingBottom: "24px",
    marginBottom: "24px",
    borderBottom: "1px solid #f0f1f3",
  },

  photoWrapper: {
    position: "relative",
    width: "82px",
    height: "82px",
    flexShrink: 0,
  },

  profilePhoto: {
    width: "82px",
    height: "82px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #eef2ff",
    display: "block",
  },

  photoPlaceholder: {
    width: "82px",
    height: "82px",
    borderRadius: "50%",
    background: "#eef2ff",
    color: "#6366f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "3px solid #e0e7ff",
    boxSizing: "border-box",
  },

  cameraButton: {
    position: "absolute",
    right: "-2px",
    bottom: "-2px",
    width: "29px",
    height: "29px",
    borderRadius: "50%",
    background: "#4f46e5",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "3px solid #ffffff",
    boxSizing: "border-box",
  },

  hiddenInput: {
    display: "none",
  },

  photoTitle: {
    margin: "0 0 5px",
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
  },

  photoDescription: {
    margin: "0 0 10px",
    fontSize: "13px",
    lineHeight: "1.5",
    color: "#6b7280",
  },

  changePhotoButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    padding: "7px 11px",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    background: "#ffffff",
    color: "#374151",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
  },

  inputWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#ffffff",
    minHeight: "43px",
    boxSizing: "border-box",
  },

  disabledInputWrapper: {
    background: "#f9fafb",
  },

  inputIcon: {
    marginLeft: "12px",
    color: "#9ca3af",
    flexShrink: 0,
  },

  input: {
    width: "100%",
    border: "none",
    outline: "none",
    padding: "11px 12px 11px 9px",
    background: "transparent",
    color: "#111827",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  disabledInput: {
    color: "#6b7280",
    cursor: "not-allowed",
  },

  helperText: {
    fontSize: "11px",
    color: "#9ca3af",
    lineHeight: "1.4",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "22px",
  },

  saveButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "11px 18px",
    border: "1px solid #4f46e5",
    borderRadius: "8px",
    background: "#4f46e5",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },

  successMessage: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 13px",
    borderRadius: "8px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#15803d",
    fontSize: "13px",
    marginTop: "20px",
  },

  errorMessage: {
    padding: "11px 13px",
    borderRadius: "8px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: "13px",
    lineHeight: "1.45",
    marginTop: "16px",
  },

  securityNotice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    borderRadius: "10px",
    background: "#f8fafc",
    color: "#475569",
  },

  noticeTitle: {
    display: "block",
    fontSize: "14px",
    color: "#1f2937",
    marginBottom: "3px",
  },

  noticeText: {
    margin: 0,
    fontSize: "13px",
    lineHeight: "1.5",
    color: "#64748b",
  },

  passwordGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },

  passwordToggle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    padding: 0,
    marginRight: "3px",
    border: "none",
    background: "transparent",
    color: "#6b7280",
    cursor: "pointer",
    flexShrink: 0,
  },

  passwordRequirements: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "18px",
    padding: "11px 13px",
    borderRadius: "8px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: "1.4",
  },

  dangerCard: {
    background: "#ffffff",
    border: "1px solid #fecaca",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
  },

  dangerIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#fef2f2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  dangerTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#b91c1c",
  },

  dangerContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #fee2e2",
  },

  deleteTitle: {
    margin: "0 0 6px",
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
  },

  deleteDescription: {
    margin: 0,
    maxWidth: "650px",
    fontSize: "13px",
    lineHeight: "1.55",
    color: "#6b7280",
  },

  deleteButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "11px 16px",
    border: "1px solid #dc2626",
    borderRadius: "8px",
    background: "#dc2626",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 9999,
    boxSizing: "border-box",
  },

  modal: {
    position: "relative",
    width: "100%",
    maxWidth: "500px",
    background: "#ffffff",
    borderRadius: "16px",
    padding: "30px",
    boxSizing: "border-box",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.2)",
  },

  closeButton: {
    position: "absolute",
    top: "16px",
    right: "16px",
    width: "34px",
    height: "34px",
    border: "none",
    borderRadius: "8px",
    background: "#f3f4f6",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  modalIcon: {
    width: "54px",
    height: "54px",
    borderRadius: "50%",
    background: "#fef2f2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "18px",
  },

  modalTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: "700",
    color: "#111827",
  },

  modalText: {
    margin: "10px 0 20px",
    fontSize: "14px",
    lineHeight: "1.55",
    color: "#6b7280",
  },

  warningBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "14px",
    borderRadius: "10px",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#c2410c",
    fontSize: "13px",
    lineHeight: "1.45",
    marginBottom: "20px",
  },

  warningText: {
    margin: "4px 0 0",
    color: "#9a3412",
  },

  checkboxRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
    fontSize: "13px",
    lineHeight: "1.45",
    color: "#374151",
    cursor: "pointer",
    marginBottom: "16px",
  },

  checkbox: {
    width: "17px",
    height: "17px",
    marginTop: "1px",
    flexShrink: 0,
    cursor: "pointer",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "6px",
  },

  cancelButton: {
    padding: "11px 17px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "#ffffff",
    color: "#374151",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },

  confirmDeleteButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "11px 17px",
    border: "1px solid #dc2626",
    borderRadius: "8px",
    background: "#dc2626",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },

  disabledButton: {
    opacity: 0.55,
    cursor: "not-allowed",
  },

  spinner: {
    animation: "spin 1s linear infinite",
  },
};

export default TechnicianSettings;
