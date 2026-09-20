import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import "./Login.css";

import logo from "../assets/proquire-logo.png";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get the selected role from the URL
  const selectedRole = searchParams.get("role");

  const roleNames = {
    client: "Client",
    technician: "Technician",
    agency: "Agency",
  };

  const currentRole = roleNames[selectedRole] || "User";

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
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

      console.log("Login successful:", data);

      // Store the JWT token
      if (data.token) {
        if (rememberMe) {
          localStorage.setItem("token", data.token);
        } else {
          sessionStorage.setItem("token", data.token);
        }
      }

      // Store user information if returned by the backend
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Determine the user's role
      const role = data.user?.role || data.role;

      // Redirect according to account type
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "technician") {
        navigate("/technician");
      } else if (role === "agency") {
        navigate("/agency");
      } else if (role === "client") {
        navigate("/client");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Invalid email or password."
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
    <div className="login-page">
      <div className="login-card">

        {/* Back to role selection */}
        <Link
          to="/role-selection"
          className="back-home"
        >
          <ArrowLeft size={18} />
          Back to Role Selection
        </Link>

        {/* Logo */}
        <div className="login-logo">
          <img src={logo} alt="ProQuire Logo" />
        </div>

        {/* Heading */}
        <div className="login-heading">
          <h1>Welcome Back</h1>

          <p>
            Log in to your ProQuire{" "}
            {selectedRole ? `${currentRole.toLowerCase()} ` : ""}
            account and connect with trusted service professionals.
          </p>
        </div>

        {/* Selected role indicator */}
        {selectedRole && (
          <div className="login-role">
            Logging in as <strong>{currentRole}</strong>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* Login form */}
        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <div className="input-wrapper">
              <Mail size={19} />

              <input
                type="email"
                id="email"
                placeholder="Enter your email"
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
                placeholder="Enter your password"
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

          {/* Remember / Forgot */}
          <div className="login-options">

            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(
                    event.target.checked
                  )
                }
              />

              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password"
            >
              Forgot Password?
            </button>

          </div>

          {/* Login button */}
          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Log In"}
          </button>

        </form>

        {/* Register */}
        <div className="login-register">
          <span>
            Don't have an account?
          </span>

          <Link
            to={
              selectedRole
                ? `/register?role=${selectedRole}`
                : "/register"
            }
          >
            Create an account
          </Link>
        </div>

        {/* Account types */}
        <div className="login-info">
          <p>
            ProQuire supports clients, technicians
            and service agencies.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;