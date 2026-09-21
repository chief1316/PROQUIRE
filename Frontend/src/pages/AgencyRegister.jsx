import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
} from "lucide-react";
import { useState } from "react";
import axios from "axios";
import "./AgencyRegister.css";

import logo from "../assets/proquire-logo.png";

function AgencyRegister() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setLoading(true);

      const registrationData = {
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: "agency",
      };

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        registrationData
      );

      console.log(
        "Agency registration response:",
        response.data
      );

      setSuccess(
        "Agency account created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        navigate("/login?role=agency");
      }, 1500);
    } catch (error) {
      console.error(
        "Agency registration error:",
        error
      );

      if (error.response) {
        setError(
          error.response.data?.message ||
            "Agency registration failed. Please try again."
        );
      } else {
        setError(
          "Unable to connect to the server. Make sure the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agency-register-page">

      <div className="agency-register-card">

        {/* Back button */}
        <Link
          to="/role-selection"
          className="agency-back-link"
        >
          <ArrowLeft size={18} />
          Back to Role Selection
        </Link>

        {/* Logo */}
        <div className="agency-register-logo">
          <img
            src={logo}
            alt="ProQuire Logo"
          />
        </div>

        {/* Heading */}
        <div className="agency-register-heading">

          <h1>
            Create Agency Account
          </h1>

          <p>
            Create your agency account to get started
            with ProQuire.
          </p>

        </div>

        {/* Error */}
        {error && (
          <div className="agency-register-error">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="agency-register-success">
            {success}
          </div>
        )}

        <form
          className="agency-register-form"
          onSubmit={handleSubmit}
        >

          {/* ================= CONTACT PERSON ================= */}

          <div className="agency-section-heading">

            <User size={18} />

            <div>
              <h2>
                Account Information
              </h2>

              <p>
                Information for the person responsible
                for this agency account
              </p>
            </div>

          </div>

          {/* Full Name */}
          <div className="agency-form-group">

            <label htmlFor="fullName">
              Contact Person Full Name
            </label>

            <div className="agency-input-wrapper">

              <User size={18} />

              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Enter full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />

            </div>

          </div>

          {/* Email */}
          <div className="agency-form-group">

            <label htmlFor="email">
              Business Email Address
            </label>

            <div className="agency-input-wrapper">

              <Mail size={18} />

              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter business email"
                value={formData.email}
                onChange={handleChange}
                required
              />

            </div>

          </div>

          {/* Phone */}
          <div className="agency-form-group">

            <label htmlFor="phone">
              Business Phone Number
            </label>

            <div className="agency-input-wrapper">

              <Phone size={18} />

              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="e.g. 0712345678"
                value={formData.phone}
                onChange={handleChange}
                required
              />

            </div>

          </div>

          {/* ================= SECURITY ================= */}

          <div className="agency-section-heading">

            <Lock size={18} />

            <div>
              <h2>
                Account Security
              </h2>

              <p>
                Create a secure password for your account
              </p>
            </div>

          </div>

          {/* Password */}
          <div className="agency-form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="agency-input-wrapper">

              <Lock size={18} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                id="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="agency-password-toggle"
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
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          {/* Confirm Password */}
          <div className="agency-form-group">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <div className="agency-input-wrapper">

              <Lock size={18} />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="agency-password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          {/* Terms */}
          <label className="agency-terms">

            <input
              type="checkbox"
              required
            />

            <span>
              I agree to the ProQuire Terms and
              Conditions.
            </span>

          </label>

          {/* Submit */}
          <button
            type="submit"
            className="agency-register-submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Agency Account"}
          </button>

        </form>

        {/* Login */}
        <div className="agency-login-link">

          <span>
            Already have an agency account?
          </span>

          <Link to="/login?role=agency">
            Log in
          </Link>

        </div>

        {/* Footer */}
        <div className="agency-register-footer">

          <span>
            ProQuire
          </span>

          <span>
            Professional Service Marketplace
          </span>

        </div>

      </div>

    </div>
  );
}

export default AgencyRegister;