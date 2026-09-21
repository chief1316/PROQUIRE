import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  LogOut,
  MapPin,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import "./AgencyDashboard.css";
import logo from "../assets/proquire-logo.png";

function AgencyDashboard() {
  const navigate = useNavigate();

  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchAgency = async () => {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        navigate("/login?role=agency");
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/api/agencies/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setAgency(response.data);
      } catch (err) {
        console.error("Error loading agency:", err);

        if (err.response?.status === 404) {
          navigate("/agency/profile-setup");
          return;
        }

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login?role=agency");
          return;
        }

        setError(
          "Unable to load your agency profile. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAgency();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login?role=agency");
  };

  const goToTechnicians = () => {
    navigate("/agency/technicians");
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="agency-dashboard-loading">
        <div className="agency-loading-spinner"></div>
        <p>Loading your agency dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agency-dashboard-error-page">
        <div className="agency-dashboard-error-card">
          <h2>Unable to Load Dashboard</h2>

          <p>{error}</p>

          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="agency-dashboard">

      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="agency-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}

      <aside
        className={`agency-sidebar ${
          sidebarOpen ? "agency-sidebar-open" : ""
        }`}
      >
        <div className="agency-sidebar-top">
          <div className="agency-sidebar-logo">
            <img
              src={logo}
              alt="ProQuire Logo"
            />
          </div>

          <button
            className="agency-sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={21} />
          </button>
        </div>

        {/* Agency identity */}

        <div className="agency-sidebar-profile">
          <div className="agency-avatar">
            <Building2 size={25} />
          </div>

          <div className="agency-sidebar-profile-info">
            <strong>
              {agency?.company_name || "Your Agency"}
            </strong>

            <span>
              Agency Account
            </span>
          </div>
        </div>

        {/* Navigation */}

        <nav className="agency-sidebar-nav">

          <button
            className="agency-nav-item active"
            onClick={() => navigate("/agency")}
          >
            <BarChart3 size={19} />
            <span>Dashboard</span>
          </button>

          <button
            className="agency-nav-item"
            onClick={() => navigate("/agency/profile-setup")}
          >
            <Building2 size={19} />
            <span>Agency Profile</span>
          </button>

          {/* TECHNICIANS */}

          <button
            className="agency-nav-item"
            onClick={goToTechnicians}
          >
            <Users size={19} />
            <span>Technicians</span>
          </button>

          <button className="agency-nav-item">
            <FileText size={19} />
            <span>Service Requests</span>
          </button>

          <button className="agency-nav-item">
            <CreditCard size={19} />
            <span>Subscription</span>
          </button>

          <button className="agency-nav-item">
            <BarChart3 size={19} />
            <span>Reports</span>
          </button>

          <button className="agency-nav-item">
            <Bell size={19} />
            <span>Notifications</span>
          </button>

        </nav>

        <div className="agency-sidebar-bottom">

          <button className="agency-nav-item">
            <Settings size={19} />
            <span>Settings</span>
          </button>

          {/* LOG OUT */}

          <button
            className="agency-nav-item"
            onClick={handleLogout}
          >
            <LogOut size={19} />
            <span>Log Out</span>
          </button>

        </div>
      </aside>

      {/* MAIN AREA */}

      <main className="agency-main">

        {/* Header */}

        <header className="agency-header">

          <button
            className="agency-menu-button"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="agency-header-title">
            <h1>
              Agency Dashboard
            </h1>

            <p>
              Manage your agency and professional team.
            </p>
          </div>

          <div className="agency-header-actions">

            <button className="agency-notification-button">
              <Bell size={21} />
              <span className="agency-notification-dot"></span>
            </button>

            <div className="agency-header-user">

              <div className="agency-header-avatar">
                <Building2 size={20} />
              </div>

              <div>
                <strong>
                  {agency?.company_name || "Agency"}
                </strong>

                <span>
                  Agency
                </span>
              </div>

            </div>

          </div>

        </header>

        {/* CONTENT */}

        <section className="agency-content">

          {/* Welcome */}

          <div className="agency-welcome-card">

            <div>

              <span className="agency-welcome-label">
                WELCOME TO PROQUIRE
              </span>

              <h2>
                Welcome, {agency?.company_name || "Agency"}
              </h2>

              <p>
                Manage your agency, technicians and professional
                services from one place.
              </p>

            </div>

            <div className="agency-welcome-icon">
              <Building2 size={42} />
            </div>

          </div>

          {/* Statistics */}

          <div className="agency-stat-grid">

            <div className="agency-stat-card">

              <div className="agency-stat-icon blue">
                <Users size={22} />
              </div>

              <div>
                <span>
                  Technicians
                </span>

                <strong>
                  0
                </strong>

                <small>
                  Team members
                </small>
              </div>

            </div>

            <div className="agency-stat-card">

              <div className="agency-stat-icon green">
                <CheckCircle2 size={22} />
              </div>

              <div>
                <span>
                  Verified
                </span>

                <strong>
                  {agency?.is_verified ? "Yes" : "Pending"}
                </strong>

                <small>
                  Agency verification
                </small>
              </div>

            </div>

            <div className="agency-stat-card">

              <div className="agency-stat-icon orange">
                <FileText size={22} />
              </div>

              <div>
                <span>
                  Requests
                </span>

                <strong>
                  0
                </strong>

                <small>
                  Service requests
                </small>
              </div>

            </div>

            <div className="agency-stat-card">

              <div className="agency-stat-icon purple">
                <CreditCard size={22} />
              </div>

              <div>
                <span>
                  Subscription
                </span>

                <strong>
                  None
                </strong>

                <small>
                  Current plan
                </small>
              </div>

            </div>

          </div>

          {/* Main dashboard grid */}

          <div className="agency-dashboard-grid">

            {/* Agency information */}

            <div className="agency-panel">

              <div className="agency-panel-header">

                <div>

                  <h3>
                    Agency Information
                  </h3>

                  <p>
                    Your registered business details
                  </p>

                </div>

                <Building2 size={21} />

              </div>

              <div className="agency-information-list">

                <div className="agency-information-item">

                  <span>
                    Company Name
                  </span>

                  <strong>
                    {agency?.company_name || "—"}
                  </strong>

                </div>

                <div className="agency-information-item">

                  <span>
                    Registration Number
                  </span>

                  <strong>
                    {agency?.registration_number || "—"}
                  </strong>

                </div>

                <div className="agency-information-item">

                  <span>
                    KRA PIN
                  </span>

                  <strong>
                    {agency?.kra_pin || "—"}
                  </strong>

                </div>

                <div className="agency-information-item">

                  <span>
                    Business Email
                  </span>

                  <strong>
                    {agency?.email || "—"}
                  </strong>

                </div>

                <div className="agency-information-item">

                  <span>
                    Business Phone
                  </span>

                  <strong>
                    {agency?.phone || "—"}
                  </strong>

                </div>

                <div className="agency-information-item">

                  <span>
                    Location
                  </span>

                  <strong className="agency-location">

                    <MapPin size={15} />

                    {agency?.county || "—"}

                  </strong>

                </div>

              </div>

            </div>

            {/* Verification status */}

            <div className="agency-panel">

              <div className="agency-panel-header">

                <div>

                  <h3>
                    Verification Status
                  </h3>

                  <p>
                    Current agency verification
                  </p>

                </div>

                <ShieldStatus
                  verified={agency?.is_verified}
                />

              </div>

              <div className="agency-verification-content">

                <div
                  className={`agency-verification-badge ${
                    agency?.is_verified
                      ? "verified"
                      : "pending"
                  }`}
                >

                  {agency?.is_verified ? (
                    <>
                      <CheckCircle2 size={20} />
                      Verified Agency
                    </>
                  ) : (
                    <>
                      <Clock3 size={20} />
                      Verification Pending
                    </>
                  )}

                </div>

                <p>
                  {agency?.is_verified
                    ? "Your agency has been verified and can operate on the ProQuire platform."
                    : "Your agency profile has been submitted and is awaiting verification by the ProQuire administrator."}
                </p>

              </div>

            </div>

          </div>

          {/* Quick actions */}

          <div className="agency-panel agency-quick-actions-panel">

            <div className="agency-panel-header">

              <div>

                <h3>
                  Quick Actions
                </h3>

                <p>
                  Common agency tasks
                </p>

              </div>

            </div>

            <div className="agency-quick-actions">

              <button
                className="agency-quick-action"
                onClick={goToTechnicians}
              >
                <Users size={22} />

                <span>
                  Manage Technicians
                </span>

              </button>

              <button className="agency-quick-action">

                <Building2 size={22} />

                <span>
                  Edit Agency Profile
                </span>

              </button>

              <button className="agency-quick-action">

                <CreditCard size={22} />

                <span>
                  Manage Subscription
                </span>

              </button>

              <button className="agency-quick-action">

                <BarChart3 size={22} />

                <span>
                  View Reports
                </span>

              </button>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

/* =========================================================
   VERIFICATION ICON
========================================================= */

function ShieldStatus({ verified }) {
  return verified ? (
    <CheckCircle2 size={24} />
  ) : (
    <Clock3 size={24} />
  );
}

export default AgencyDashboard;