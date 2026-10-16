import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ClientSettings.css";

const API_URL = "http://localhost:5000/api/clients";
const SERVER_URL = "http://localhost:5000";

const emptyProfile = {
  full_name: "",
  email: "",
  phone: "",
  location: "",
};

const normalizeKenyanPhone = (value) => {
  const phone = value.replace(/[\s()-]/g, "");

  if (/^0[17]\d{8}$/.test(phone)) {
    return `+254${phone.slice(1)}`;
  }

  if (/^254[17]\d{8}$/.test(phone)) {
    return `+${phone}`;
  }

  if (/^\+254[17]\d{8}$/.test(phone)) {
    return phone;
  }

  return null;
};

function ClientSettings() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  const [profile, setProfile] = useState(emptyProfile);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const getPhotoUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `${SERVER_URL}/uploads/${path.replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/my-profile`, authConfig);

        const data = response.data.profile || response.data;

        setProfile({
          full_name: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
        });

        setProfilePhoto(data.profile_photo || "");
      } catch (err) {
        // A missing client profile can be completed using the save form.
        if (err.response?.status === 404) {
          setMessage("Complete your profile details below.");
        } else if (err.response?.status === 401) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          navigate("/");
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load your profile. Please try again.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setMessage("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Choose a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Your image must be smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    setSelectedPhoto(file);

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (event) => {
    event.preventDefault();

    const normalizedPhone = normalizeKenyanPhone(profile.phone);

    if (!normalizedPhone) {
      setError(
        "Enter a valid Kenyan phone number, e.g. 0712345678 or +254712345678.",
      );
      setMessage("");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.patch(
        `${API_URL}/profile`,
        {
          ...profile,
          phone: normalizedPhone,
        },
        authConfig,
      );

      const data = response.data.profile || response.data;

      setProfile({
        full_name: data.full_name ?? profile.full_name,
        email: data.email ?? profile.email,
        phone: data.phone ?? profile.phone,
        location: data.location ?? profile.location,
      });

      if (data.profile_photo !== undefined) {
        setProfilePhoto(data.profile_photo || "");
      }

      // Keep the cached user details in step with the saved profile.
      try {
        const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");

        sessionStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            full_name: data.full_name ?? profile.full_name,
            email: data.email ?? profile.email,
            phone: data.phone ?? profile.phone,
            profile_photo: data.profile_photo ?? profilePhoto,
          }),
        );
      } catch {
        // Profile saving should still succeed if cached user data is invalid.
      }

      setMessage(response.data.message || "Profile saved successfully.");
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        navigate("/");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to save your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPhoto = async () => {
    if (!selectedPhoto) {
      setError("Please choose a photo first.");
      return;
    }

    const formData = new FormData();
    formData.append("profile_photo", selectedPhoto);

    setUploadingPhoto(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(`${API_URL}/profile/photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const savedPath = response.data.profile_photo;

      setProfilePhoto(savedPath || "");
      setSelectedPhoto(null);
      setPhotoPreview("");

      try {
        const storedUser = JSON.parse(sessionStorage.getItem("user") || "{}");

        sessionStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            profile_photo: savedPath,
          }),
        );
      } catch {
        // Photo upload should still succeed if cached user data is invalid.
      }

      setMessage(
        response.data.message || "Profile photo updated successfully.",
      );
    } catch (err) {
      if (err.response?.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        navigate("/");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to upload your photo. Please try again.",
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Your new passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("Your new password must differ from your current password.");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await axios.put(
        `${SERVER_URL}/api/auth/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        authConfig,
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setMessage(response.data.message || "Password changed successfully.");
    } catch (err) {
      if (
        err.response?.status === 401 &&
        /token|expired|authentication/i.test(err.response?.data?.message || "")
      ) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        navigate("/");
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to change your password. Please try again.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  if (loading) {
    return (
      <div className="client-settings-loading">Loading your settings...</div>
    );
  }

  return (
    <main className="client-settings-page">
      <header className="settings-topbar">
        <Link to="/client" className="settings-brand">
          ProQuire
        </Link>

        <nav className="settings-navigation">
          <Link to="/client">Dashboard</Link>
          <button type="button" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      </header>

      <section className="settings-container">
        <div className="settings-heading">
          <div>
            <p className="settings-eyebrow">ACCOUNT</p>
            <h1>Settings</h1>
            <p>Manage your personal information and profile photo.</p>
          </div>

          <Link to="/client" className="settings-back-link">
            ← Back to dashboard
          </Link>
        </div>

        {message && (
          <div className="settings-alert settings-alert-success" role="status">
            {message}
          </div>
        )}

        {error && (
          <div className="settings-alert settings-alert-error" role="alert">
            {error}
          </div>
        )}

        <section className="settings-card photo-card">
          <div className="settings-card-heading">
            <h2>Profile photo</h2>
            <p>Add a photo so your account is easier to recognize.</p>
          </div>

          <div className="photo-settings-content">
            <div className="settings-avatar">
              {photoPreview || profilePhoto ? (
                <img
                  src={photoPreview || getPhotoUrl(profilePhoto)}
                  alt="Profile"
                />
              ) : (
                <span>
                  {profile.full_name
                    ? profile.full_name.trim().charAt(0).toUpperCase()
                    : "U"}
                </span>
              )}
            </div>

            <div className="photo-controls">
              <label
                htmlFor="profile-photo"
                className="settings-button settings-button-secondary"
              >
                Choose photo
              </label>

              <input
                id="profile-photo"
                className="settings-file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange}
              />

              <p className="settings-help">
                JPG, PNG, or WEBP. Maximum file size: 10 MB.
              </p>

              {selectedPhoto && (
                <p className="settings-selected-file">
                  Selected: {selectedPhoto.name}
                </p>
              )}

              {selectedPhoto && (
                <button
                  type="button"
                  className="settings-button settings-button-primary"
                  onClick={handleUploadPhoto}
                  disabled={uploadingPhoto}
                >
                  {uploadingPhoto ? "Uploading..." : "Upload photo"}
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-heading">
            <h2>Personal information</h2>
            <p>Update the details associated with your account.</p>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="settings-form-grid">
              <div className="settings-field">
                <label htmlFor="full_name">Full name</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={profile.full_name}
                  onChange={handleChange}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="settings-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  maxLength={255}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="settings-field">
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(event) => {
                    const raw = event.target.value;
                    const trimmed = raw.trimStart();
                    const digits = trimmed.replace(/\D/g, "");
                    const isInternational =
                      trimmed.startsWith("+") || digits.startsWith("254");
                    const maxDigits = isInternational ? 12 : 10;

                    if (digits.length > maxDigits) return;

                    handleChange(event);
                  }}
                  maxLength={13}
                  placeholder="0712345678 or +254712345678"
                  autoComplete="tel"
                  required
                />
              </div>

              <div className="settings-field">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={profile.location}
                  onChange={handleChange}
                  maxLength={255}
                  autoComplete="address-level2"
                  required
                />
              </div>
            </div>

            <div className="settings-form-actions">
              <button
                type="submit"
                className="settings-button settings-button-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </section>

        {/* CHANGE PASSWORD */}
        <section className="settings-card">
          <div className="settings-card-heading">
            <h2>Change password</h2>
            <p>Update your password to help keep your account secure.</p>
          </div>

          <form onSubmit={handleChangePassword}>
            <div className="settings-form-grid">
              <div className="settings-field">
                <label htmlFor="current-password">Current password</label>
                <div className="password-input-wrapper">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                    aria-pressed={showCurrentPassword}
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <div className="settings-field">
                <label htmlFor="new-password">New password</label>
                <div className="password-input-wrapper">
                  <input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    maxLength={128}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                    aria-pressed={showNewPassword}
                  >
                    {showNewPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
                <p className="settings-help">Use at least 8 characters.</p>
              </div>

              <div className="settings-field">
                <label htmlFor="confirm-password">Confirm new password</label>
                <div className="password-input-wrapper">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    maxLength={128}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    aria-pressed={showConfirmPassword}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="settings-form-actions">
              <button
                type="submit"
                className="settings-button settings-button-primary"
                disabled={changingPassword}
              >
                {changingPassword ? "Changing password..." : "Change password"}
              </button>
            </div>
          </form>
        </section>

        <section className="settings-card settings-account-card">
          <div>
            <h2>Account</h2>
            <p>Finished managing your account?</p>
          </div>

          <button
            type="button"
            className="settings-button settings-button-danger"
            onClick={handleLogout}
          >
            Log out
          </button>
        </section>
      </section>
    </main>
  );
}

export default ClientSettings;
