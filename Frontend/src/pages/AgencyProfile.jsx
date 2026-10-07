import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Building2,
  CreditCard,
  FileText,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  Clock3,
  Pencil,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import "./AgencyProfile.css";

import logo from "../assets/proquire-logo.png";

function AgencyProfile() {
  const navigate = useNavigate();

  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Fetch logged-in agency
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchAgency = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");

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
          },
        );

        setAgency(response.data);
      } catch (err) {
        console.error("Error loading agency profile:", err);

        if (err.response?.status === 404) {
          navigate("/agency/profile-setup");
          return;
        }

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");

          navigate("/login?role=agency");
          return;
        }

        setError("Unable to load your agency profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAgency();
  }, [navigate]);

  /*
  |--------------------------------------------------------------------------
  | Logout
  |--------------------------------------------------------------------------
  */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login?role=agency");
  };

  /*
  |--------------------------------------------------------------------------
  | Logo URL
  |--------------------------------------------------------------------------
  */

  const getAgencyLogo = () => {
    if (!agency?.logo) {
      return logo;
    }

    if (
      agency.logo.startsWith("http://") ||
      agency.logo.startsWith("https://")
    ) {
      return agency.logo;
    }

    const cleanPath = agency.logo.replace(/\\/g, "/").replace(/^\/+/, "");

    return `http://localhost:5000/${cleanPath}`;
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="agency-profile-loading">
        <div className="agency-profile-loading-spinner"></div>

        <p>Loading your agency profile...</p>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error) {
    return (
      <div className="agency-profile-error-page">
        <div className="agency-profile-error-card">
          <h2>Unable to Load Profile</h2>

          <p>{error}</p>

          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="agency-profile-dashboard">
      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="agency-profile-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`agency-profile-sidebar ${
          sidebarOpen ? "agency-profile-sidebar-open" : ""
        }`}
      >
        <div className="agency-profile-sidebar-top">
          <div className="agency-profile-sidebar-logo">
            <img src={logo} alt="ProQuire Logo" />
          </div>

          <button
            className="agency-profile-sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={21} />
          </button>
        </div>

        {/* Agency identity */}

        <div className="agency-profile-sidebar-identity">
          <div className="agency-profile-sidebar-avatar">
            <img
              src={getAgencyLogo()}
              alt={agency?.company_name || "Agency"}
              onError={(event) => {
                event.currentTarget.src = logo;
              }}
            />
          </div>

          <div>
            <strong>{agency?.company_name || "Your Agency"}</strong>

            <span>Agency Account</span>
          </div>
        </div>

        {/* Navigation */}

        <nav className="agency-profile-sidebar-nav">
          <button
            className="agency-profile-nav-item"
            onClick={() => {
              navigate("/agency");
              setSidebarOpen(false);
            }}
          >
            <Building2 size={19} />
            <span>Dashboard</span>
          </button>

          <button
            className="agency-profile-nav-item active"
            onClick={() => setSidebarOpen(false)}
          >
            <Building2 size={19} />
            <span>Agency Profile</span>
          </button>

          <button
            className="agency-profile-nav-item"
            onClick={() => {
              navigate("/agency/technicians");
              setSidebarOpen(false);
            }}
          >
            <Building2 size={19} />
            <span>Technicians</span>
          </button>
        </nav>

        <div className="agency-profile-sidebar-bottom">
          <button
            className="agency-profile-nav-item"
            onClick={() => {
              navigate("/agency");
              setSidebarOpen(false);
            }}
          >
            <ArrowLeft size={19} />
            <span>Back to Dashboard</span>
          </button>

          <button className="agency-profile-nav-item" onClick={handleLogout}>
            <LogOut size={19} />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <main className="agency-profile-main">
        {/* Header */}

        <header className="agency-profile-header">
          <button
            className="agency-profile-menu-button"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div>
            <h1>Agency Profile</h1>

            <p>View and manage your registered agency information.</p>
          </div>

          <div className="agency-profile-header-actions">
            <div className="agency-profile-header-avatar">
              <img
                src={getAgencyLogo()}
                alt={agency?.company_name || "Agency"}
                onError={(event) => {
                  event.currentTarget.src = logo;
                }}
              />
            </div>

            <div>
              <strong>{agency?.company_name || "Agency"}</strong>

              <span>Agency</span>
            </div>
          </div>
        </header>

        {/* =====================================================
            CONTENT
        ===================================================== */}

        <section className="agency-profile-content">
          {/* Back */}

          <Link to="/agency" className="agency-profile-back-link">
            <ArrowLeft size={18} />
            Back to Dashboard
          </Link>

          {/* ===================================================
              PROFILE HERO
          =================================================== */}

          <div className="agency-profile-hero">
            <div className="agency-profile-hero-logo">
              <img
                src={getAgencyLogo()}
                alt={agency?.company_name || "Agency"}
                onError={(event) => {
                  event.currentTarget.src = logo;
                }}
              />
            </div>

            <div className="agency-profile-hero-info">
              <span className="agency-profile-eyebrow">AGENCY PROFILE</span>

              <h2>{agency?.company_name || "Your Agency"}</h2>

              <p>
                {agency?.description ||
                  "Your registered agency profile on ProQuire."}
              </p>

              <div className="agency-profile-status">
                {agency?.is_verified ? (
                  <div className="agency-profile-status verified">
                    <ShieldCheck size={18} />
                    Verified Agency
                  </div>
                ) : (
                  <div className="agency-profile-status pending">
                    <Clock3 size={18} />
                    Verification Pending
                  </div>
                )}
              </div>
            </div>

            <button
              className="agency-profile-edit-button"
              onClick={() => navigate("/agency/profile-setup")}
            >
              <Pencil size={17} />
              Edit Profile
            </button>
          </div>

          {/* ===================================================
              PROFILE INFORMATION
          =================================================== */}

          <div className="agency-profile-grid">
            {/* Business Information */}

            <div className="agency-profile-card">
              <div className="agency-profile-card-header">
                <div className="agency-profile-card-icon">
                  <Building2 size={21} />
                </div>

                <div>
                  <h3>Business Information</h3>

                  <p>Your official registered business details.</p>
                </div>
              </div>

              <div className="agency-profile-details">
                <div className="agency-profile-detail">
                  <span>Company Name</span>

                  <strong>{agency?.company_name || "—"}</strong>
                </div>

                <div className="agency-profile-detail">
                  <span>Registration Number</span>

                  <strong>{agency?.registration_number || "—"}</strong>
                </div>

                <div className="agency-profile-detail">
                  <span>KRA PIN</span>

                  <strong>{agency?.kra_pin || "—"}</strong>
                </div>

                <div className="agency-profile-detail">
                  <span>County</span>

                  <strong>{agency?.county || "—"}</strong>
                </div>
              </div>
            </div>

            {/* Contact Information */}

            <div className="agency-profile-card">
              <div className="agency-profile-card-header">
                <div className="agency-profile-card-icon">
                  <Mail size={21} />
                </div>

                <div>
                  <h3>Contact Information</h3>

                  <p>Contact details linked to your agency account.</p>
                </div>
              </div>

              <div className="agency-profile-details">
                <div className="agency-profile-detail">
                  <span>Business Email</span>

                  <strong className="agency-profile-contact-value">
                    <Mail size={16} />
                    {agency?.email || "—"}
                  </strong>
                </div>

                <div className="agency-profile-detail">
                  <span>Business Phone</span>

                  <strong className="agency-profile-contact-value">
                    <Phone size={16} />
                    {agency?.phone || "—"}
                  </strong>
                </div>

                <div className="agency-profile-detail">
                  <span>Physical Address</span>

                  <strong className="agency-profile-contact-value">
                    <MapPin size={16} />
                    {agency?.address || "—"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================
              DESCRIPTION
          =================================================== */}

          <div className="agency-profile-card agency-profile-description-card">
            <div className="agency-profile-card-header">
              <div className="agency-profile-card-icon">
                <FileText size={21} />
              </div>

              <div>
                <h3>Agency Description</h3>

                <p>Information about the services your agency provides.</p>
              </div>
            </div>

            <div className="agency-profile-description">
              <p>
                {agency?.description ||
                  "No agency description has been added yet."}
              </p>
            </div>
          </div>

          {/* ===================================================
              VERIFICATION
          =================================================== */}

          <div className="agency-profile-card agency-profile-verification-card">
            <div className="agency-profile-card-header">
              <div className="agency-profile-card-icon">
                <ShieldCheck size={21} />
              </div>

              <div>
                <h3>Verification Status</h3>

                <p>Current verification status of your agency.</p>
              </div>
            </div>

            <div className="agency-profile-verification-body">
              {agency?.is_verified ? (
                <>
                  <div className="agency-profile-large-status verified">
                    <ShieldCheck size={23} />
                    <div>
                      <strong>Verified Agency</strong>
                      <span>Your agency has been verified by ProQuire.</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="agency-profile-large-status pending">
                    <Clock3 size={23} />
                    <div>
                      <strong>Verification Pending</strong>
                      <span>
                        Your agency profile is awaiting verification by the
                        ProQuire administrator.
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AgencyProfile;
