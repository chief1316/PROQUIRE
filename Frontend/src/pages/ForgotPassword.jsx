import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import "./Login.css";

import logo from "../assets/proquire-logo.png";

function ForgotPassword() {
  const [searchParams] = useSearchParams();

  const selectedRole = searchParams.get("role");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/users/forgot-password",
        {
          email,
        },
      );

      setMessage(
        response.data?.message ||
          "If an account exists with that email, a password reset link has been sent.",
      );
    } catch (err) {
      console.error("Forgot password error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Link
          to={selectedRole ? `/login?role=${selectedRole}` : "/login"}
          className="back-home"
        >
          <ArrowLeft size={18} />
          Back to Login
        </Link>

        <div className="login-logo">
          <img src={logo} alt="ProQuire Logo" />
        </div>

        <div className="login-heading">
          <h1>Forgot Password?</h1>

          <p>
            Enter your email address and we'll send you a secure link to reset
            your ProQuire password.
          </p>
        </div>

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
            {message}
          </div>
        )}

        {error && <div className="login-error">{error}</div>}

        {!message && (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="forgot-email">Email Address</label>

              <div className="input-wrapper">
                <Mail size={19} />

                <input
                  type="email"
                  id="forgot-email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="login-register">
          <span>Remember your password?</span>

          <Link to={selectedRole ? `/login?role=${selectedRole}` : "/login"}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
