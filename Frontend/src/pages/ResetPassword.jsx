import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import "./Login.css";

import logo from "../assets/proquire-logo.png";

function ResetPassword() {
  const { token } = useParams();

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    // ------------------------------------------
    // Validate reset token
    // ------------------------------------------

    if (!token) {
      setError("This password reset link is invalid.");

      return;
    }

    // ------------------------------------------
    // Validate password
    // ------------------------------------------

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");

      return;
    }

    if (newPassword.length < 8) {
      setError("Your new password must be at least 8 characters long.");

      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");

      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/users/reset-password",
        {
          token,
          new_password: newPassword,
        },
      );

      setMessage(
        response.data?.message || "Your password has been reset successfully.",
      );

      // Clear password fields
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Reset password error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to reset your password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* -------------------------------- */}
        {/* Back to Login                     */}
        {/* -------------------------------- */}

        <Link to="/login" className="back-home">
          <ArrowLeft size={18} />
          Back to Login
        </Link>

        {/* -------------------------------- */}
        {/* Logo                              */}
        {/* -------------------------------- */}

        <div className="login-logo">
          <img src={logo} alt="ProQuire Logo" />
        </div>

        {/* -------------------------------- */}
        {/* Heading                           */}
        {/* -------------------------------- */}

        <div className="login-heading">
          <h1>Reset Password</h1>

          <p>Create a new password for your ProQuire account.</p>
        </div>

        {/* -------------------------------- */}
        {/* Success message                   */}
        {/* -------------------------------- */}

        {message && (
          <div
            className="login-success"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <CheckCircle size={18} />

            <span>{message}</span>
          </div>
        )}

        {/* -------------------------------- */}
        {/* Error message                     */}
        {/* -------------------------------- */}

        {error && <div className="login-error">{error}</div>}

        {/* -------------------------------- */}
        {/* Reset form                        */}
        {/* -------------------------------- */}

        {!message && (
          <form className="login-form" onSubmit={handleSubmit}>
            {/* New password */}

            <div className="form-group">
              <label htmlFor="new-password">New Password</label>

              <div className="input-wrapper">
                <Lock size={19} />

                <input
                  type={showPassword ? "text" : "password"}
                  id="new-password"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}

            <div className="form-group">
              <label htmlFor="confirm-password">Confirm New Password</label>

              <div className="input-wrapper">
                <Lock size={19} />

                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm-password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Password requirement */}

            <p
              style={{
                marginTop: "-8px",
                marginBottom: "8px",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Password must be at least 8 characters long.
            </p>

            {/* Submit */}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* -------------------------------- */}
        {/* After successful reset            */}
        {/* -------------------------------- */}

        {message && (
          <div
            className="login-register"
            style={{
              marginTop: "20px",
            }}
          >
            <span>Ready to continue?</span>

            <Link to="/login">Log in</Link>
          </div>
        )}

        {/* -------------------------------- */}
        {/* Normal bottom link                */}
        {/* -------------------------------- */}

        {!message && (
          <div className="login-register">
            <span>Remember your password?</span>

            <Link to="/login">Log in</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
