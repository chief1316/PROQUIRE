import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useState } from "react";
import axios from "axios";
import "./Register.css";

import logo from "../assets/proquire-logo.png";

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedRole = searchParams.get("role");

  const roleNames = {
    client: "Client",
    technician: "Technician",
    agency: "Agency",
  };

  const currentRole = roleNames[selectedRole] || "User";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !fullName ||
      !phone ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (!selectedRole || !roleNames[selectedRole]) {
      setError("Please select an account type first.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          full_name: fullName,
          phone,
          email,
          password,
          role: selectedRole,
        }
      );

      console.log(
        "Registration successful:",
        response.data
      );

      setSuccess(
        "Account created successfully. You can now log in."
      );

      setTimeout(() => {
        navigate(`/login?role=${selectedRole}`);
      }, 1500);

    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Unable to create account."
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
    <div className="register-page">

      <div className="register-card">

        {/* Back to login */}
        <Link
          to={
            selectedRole
              ? `/login?role=${selectedRole}`
              : "/role-selection"
          }
          className="back-home"
        >
          <ArrowLeft size={18} />
          Back to Login
        </Link>

        {/* Logo */}
        <div className="register-logo">
          <img
            src={logo}
            alt="ProQuire Logo"
          />
        </div>

        {/* Heading */}
        <div className="register-heading">

          <h1>
            Create Your Account
          </h1>

          <p>
            Join ProQuire and connect with clients and
            skilled professionals.
          </p>

        </div>

        {/* Selected role */}
        {selectedRole && (
          <div className="register-role">
            Creating account as{" "}
            <strong>
              {currentRole}
            </strong>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="register-error">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="register-success">
            {success}
          </div>
        )}

        {/* Registration form */}
        <form
          className="register-form"
          onSubmit={handleRegister}
        >

          {/* Full name / Contact person */}
          <div className="form-group">

            <label htmlFor="fullName">
              {selectedRole === "agency"
                ? "Contact Person"
                : "Full Name"}
            </label>

            <div className="input-wrapper">

              <User size={19} />

              <input
                type="text"
                id="fullName"
                placeholder={
                  selectedRole === "agency"
                    ? "Enter contact person's name"
                    : "Enter your full name"
                }
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                required
              />

            </div>

          </div>

          {/* Phone */}
          <div className="form-group">

            <label htmlFor="phone">
              {selectedRole === "agency"
                ? "Business Phone"
                : "Phone Number"}
            </label>

            <div className="input-wrapper">

              <Phone size={19} />

              <input
                type="tel"
                id="phone"
                placeholder={
                  selectedRole === "agency"
                    ? "Enter business phone number"
                    : "Enter your phone number"
                }
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                required
              />

            </div>

          </div>

          {/* Email */}
          <div className="form-group">

            <label htmlFor="email">
              {selectedRole === "agency"
                ? "Business Email"
                : "Email Address"}
            </label>

            <div className="input-wrapper">

              <Mail size={19} />

              <input
                type="email"
                id="email"
                placeholder={
                  selectedRole === "agency"
                    ? "Enter business email"
                    : "Enter your email"
                }
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

            </div>

          </div>

          {/* Password */}
          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <div className="input-wrapper">

              <Lock size={19} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                id="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

              <button
                type="button"
                className="password-toggle"
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

          {/* Confirm password */}
          <div className="form-group">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <div className="input-wrapper">

              <Lock size={19} />

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                required
              />

              <button
                type="button"
                className="password-toggle"
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
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>

            </div>

          </div>

          {/* Register button */}
          <button
            type="submit"
            className="register-submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        {/* Login link */}
        <div className="register-login">

          <span>
            Already have an account?
          </span>

          <Link
            to={
              selectedRole
                ? `/login?role=${selectedRole}`
                : "/login"
            }
          >
            Log in
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Register;