import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import "./AdminLogin.css";

import logo from "../assets/proquire-logo.png";

function AdminLogin() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (event) => {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      const data = response.data;

      console.log("Admin login response:", data);

      const role = data.user?.role || data.role;

      // Make sure this is actually an administrator account
      if (role !== "admin") {
        setError(
          "Access denied. This login is restricted to administrators."
        );
        return;
      }

      // Store authentication information
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Go to admin dashboard
      navigate("/admin");

    } catch (err) {
      console.error("Admin login error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Invalid administrator credentials."
        );
      } else {
        setError(
          "Unable to connect to the ProQuire server. Make sure the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">

      <div className="admin-login-card">

        {/* Back to role selection */}
        <Link
          to="/role-selection"
          className="admin-back-link"
        >
          <ArrowLeft size={18} />
          Back to Role Selection
        </Link>


        {/* Logo */}
        <div className="admin-login-logo">
          <img
            src={logo}
            alt="ProQuire Logo"
          />
        </div>


        {/* Security badge */}
        <div className="admin-security-badge">
          <ShieldCheck size={18} />
          Administrator Access
        </div>


        {/* Heading */}
        <div className="admin-login-heading">

          <h1>Admin Login</h1>

          <p>
            Sign in to access the ProQuire administration
            dashboard.
          </p>

        </div>


        {/* Error */}
        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}


        {/* Login form */}
        <form
          className="admin-login-form"
          onSubmit={handleAdminLogin}
        >

          {/* Email */}
          <div className="admin-form-group">

            <label htmlFor="admin-email">
              Email Address
            </label>

            <div className="admin-input-wrapper">

              <Mail size={19} />

              <input
                type="email"
                id="admin-email"
                placeholder="Enter administrator email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

            </div>

          </div>


          {/* Password */}
          <div className="admin-form-group">

            <label htmlFor="admin-password">
              Password
            </label>

            <div className="admin-input-wrapper">

              <Lock size={19} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                id="admin-password"
                placeholder="Enter administrator password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

              <button
                type="button"
                className="admin-password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>

            </div>

          </div>


          {/* Login button */}
          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In as Administrator"}
          </button>

        </form>


        {/* Security notice */}
        <div className="admin-security-notice">

          <ShieldCheck size={17} />

          <p>
            Administrator access is restricted to
            authorized ProQuire administrators.
          </p>

        </div>

      </div>

    </div>
  );
}

export default AdminLogin;