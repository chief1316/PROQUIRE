import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  Settings as SettingsIcon,
  UserRound,
  Save,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/users";

const cardStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "24px",
  marginBottom: "20px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#142b4a",
  background: "#fff",
};

const primaryButtonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  border: "none",
  borderRadius: "8px",
  padding: "11px 16px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
};

function AgencySettings() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = () => sessionStorage.getItem("token");

  const authConfig = () => ({
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();

      if (!token) {
        navigate("/login?role=agency");
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(response.data);
        setFullName(response.data.full_name || "");
        setPhone(response.data.phone || "");
      } catch (err) {
        console.error("Error loading account settings:", err);

        if (err.response?.status === 401) {
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          navigate("/login?role=agency");
          return;
        }

        setError(
          err.response?.data?.message ||
            "Unable to load your account information.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }

    setSavingProfile(true);

    try {
      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      formData.append("phone", phone.trim());

      await axios.put(`${API_URL}/me`, formData, {
        headers: {
          ...authConfig().headers,
          "Content-Type": "multipart/form-data",
        },
      });

      const response = await axios.get(`${API_URL}/me`, authConfig());

      setUser(response.data);
      setFullName(response.data.full_name || "");
      setPhone(response.data.phone || "");
      setEditingProfile(false);
      setMessage("Account information updated successfully.");
    } catch (err) {
      console.error("Error updating account:", err);
      setError(
        err.response?.data?.message ||
          "Unable to update your account information.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please complete all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The new password and confirmation do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await axios.put(
        `${API_URL}/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword,
        },
        authConfig(),
      );

      setMessage(response.data?.message || "Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Error changing password:", err);
      setError(
        err.response?.data?.message || "Unable to change your password.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const cancelProfileEdit = () => {
    setFullName(user?.full_name || "");
    setPhone(user?.phone || "");
    setEditingProfile(false);
    setError("");
    setMessage("");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f4f7fc",
          color: "#718096",
        }}
      >
        Loading account settings...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fc",
        padding: "32px",
        color: "#142b4a",
      }}
    >
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => navigate("/agency")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            border: "none",
            background: "transparent",
            color: "#2563eb",
            cursor: "pointer",
            marginBottom: "24px",
            fontSize: "15px",
          }}
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>

        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "grid",
              placeItems: "center",
              width: "54px",
              height: "54px",
              borderRadius: "14px",
              background: "#e6efff",
              color: "#2166df",
              flexShrink: 0,
            }}
          >
            <SettingsIcon size={27} />
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: "28px" }}>Agency Settings</h1>
            <p style={{ margin: "8px 0 0", color: "#718096" }}>
              Manage your agency account and security.
            </p>
          </div>
        </header>

        {message && (
          <div
            role="status"
            style={{
              background: "#ecfdf5",
              border: "1px solid #a7f3d0",
              color: "#047857",
              padding: "13px 16px",
              borderRadius: "10px",
              marginBottom: "18px",
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              padding: "13px 16px",
              borderRadius: "10px",
              marginBottom: "18px",
            }}
          >
            {error}
          </div>
        )}

        {/* ACCOUNT INFORMATION */}
        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <UserRound size={22} color="#2563eb" />
            <div>
              <h2 style={{ margin: 0, fontSize: "19px" }}>
                Account Information
              </h2>
              <p
                style={{
                  margin: "5px 0 0",
                  color: "#718096",
                  fontSize: "14px",
                }}
              >
                Manage your personal account details.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: "24px" }}>
            <strong>{user?.full_name || "Agency user"}</strong>
            <p style={{ margin: "5px 0", color: "#718096" }}>{user?.email}</p>
          </div>

          {!editingProfile ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "18px",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "#718096",
                      margin: "0 0 6px",
                      fontSize: "14px",
                    }}
                  >
                    Full name
                  </p>
                  <strong>{user?.full_name || "Not provided"}</strong>
                </div>
                <div>
                  <p
                    style={{
                      color: "#718096",
                      margin: "0 0 6px",
                      fontSize: "14px",
                    }}
                  >
                    Email address
                  </p>
                  <strong>{user?.email || "Not provided"}</strong>
                </div>
                <div>
                  <p
                    style={{
                      color: "#718096",
                      margin: "0 0 6px",
                      fontSize: "14px",
                    }}
                  >
                    Phone number
                  </p>
                  <strong>{user?.phone || "Not provided"}</strong>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setError("");
                  setMessage("");
                  setEditingProfile(true);
                }}
                style={{ ...primaryButtonStyle, marginTop: "24px" }}
              >
                Edit Account Information
              </button>
            </>
          ) : (
            <form onSubmit={handleProfileSave}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "18px",
                }}
              >
                <label
                  style={{ display: "grid", gap: "8px", fontSize: "14px" }}
                >
                  Full name
                  <input
                    style={inputStyle}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    maxLength={255}
                  />
                </label>

                <label
                  style={{ display: "grid", gap: "8px", fontSize: "14px" }}
                >
                  Email address
                  <input
                    style={{ ...inputStyle, background: "#f1f5f9" }}
                    value={user?.email || ""}
                    disabled
                  />
                  <span style={{ color: "#718096", fontSize: "12px" }}>
                    Email editing is not currently supported by the backend.
                  </span>
                </label>

                <label
                  style={{ display: "grid", gap: "8px", fontSize: "14px" }}
                >
                  Phone number
                  <input
                    style={inputStyle}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={30}
                  />
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "22px",
                }}
              >
                <button
                  type="submit"
                  disabled={savingProfile}
                  style={{
                    ...primaryButtonStyle,
                    opacity: savingProfile ? 0.7 : 1,
                  }}
                >
                  <Save size={16} />
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  onClick={cancelProfileEdit}
                  disabled={savingProfile}
                  style={{
                    ...primaryButtonStyle,
                    background: "#e2e8f0",
                    color: "#334155",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        {/* AGENCY PROFILE */}
        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <Building2 size={22} color="#2563eb" />
            <h2 style={{ margin: 0, fontSize: "19px" }}>Agency Profile</h2>
          </div>

          <p style={{ color: "#718096", lineHeight: 1.6 }}>
            Your registered business information, registration details, and
            verification status are managed separately.
          </p>

          <button
            type="button"
            onClick={() => navigate("/agency/profile")}
            style={primaryButtonStyle}
          >
            View Agency Profile
          </button>
        </section>

        {/* PASSWORD SECURITY */}
        <section style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <ShieldCheck size={22} color="#2563eb" />
            <h2 style={{ margin: 0, fontSize: "19px" }}>Security</h2>
          </div>

          <p
            style={{
              color: "#718096",
              lineHeight: 1.6,
              marginBottom: "22px",
            }}
          >
            Change your password to help keep your account secure.
          </p>

          <form onSubmit={handlePasswordChange}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px",
              }}
            >
              <label style={{ display: "grid", gap: "8px", fontSize: "14px" }}>
                Current password
                <input
                  style={inputStyle}
                  type={showPasswords ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </label>

              <label style={{ display: "grid", gap: "8px", fontSize: "14px" }}>
                New password
                <input
                  style={inputStyle}
                  type={showPasswords ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>

              <label style={{ display: "grid", gap: "8px", fontSize: "14px" }}>
                Confirm new password
                <input
                  style={inputStyle}
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowPasswords((previous) => !previous)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                border: "none",
                background: "transparent",
                color: "#2563eb",
                padding: "14px 0",
                cursor: "pointer",
              }}
            >
              {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPasswords ? "Hide passwords" : "Show passwords"}
            </button>

            <div>
              <button
                type="submit"
                disabled={changingPassword}
                style={{
                  ...primaryButtonStyle,
                  opacity: changingPassword ? 0.7 : 1,
                }}
              >
                <LockKeyhole size={16} />
                {changingPassword ? "Updating..." : "Change Password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default AgencySettings;
