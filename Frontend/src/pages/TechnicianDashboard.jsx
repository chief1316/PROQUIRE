import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  User,
  ShieldCheck,
  CalendarDays,
  ClipboardList,
  Star,
  BriefcaseBusiness,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  CheckCircle,
  Clock3,
  AlertCircle,
  ArrowRight,
  Menu,
  X,
  Wrench,
} from "lucide-react";

function TechnicianDashboard() {
  const navigate = useNavigate();

  const [technicianProfile, setTechnicianProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  }, []);

  const technicianName =
    user.full_name ||
    user.name ||
    technicianProfile?.full_name ||
    "Technician";

  useEffect(() => {
    const fetchTechnicianProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/technicians/my-profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTechnicianProfile(response.data);
      } catch (error) {
        console.error("Error fetching technician profile:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          sessionStorage.removeItem("token");

          navigate("/login");
        }
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchTechnicianProfile();
  }, [navigate]);

  const profileCompletion = useMemo(() => {
    if (!technicianProfile) {
      return 25;
    }

    const requirements = [
      Boolean(technicianProfile.category_id),
      Boolean(technicianProfile.bio),
      technicianProfile.years_experience !== null &&
        technicianProfile.years_experience !== undefined,
      Boolean(technicianProfile.location),
      Boolean(technicianProfile.employment_type),
    ];

    if (technicianProfile.employment_type === "Agency") {
      requirements.push(Boolean(technicianProfile.agency_id));
    }

    const completed = requirements.filter(Boolean).length;

    return Math.round((completed / requirements.length) * 100);
  }, [technicianProfile]);

  const isProfileComplete = profileCompletion === 100;

  const isVerified =
    technicianProfile?.is_verified === 1 ||
    technicianProfile?.is_verified === true;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");

    navigate("/login");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            overflow-x: hidden;
          }

          .technician-dashboard-page {
            width: 100%;
            min-height: 100vh;
          }

          .technician-sidebar {
            transform: translateX(0);
            transition: transform 0.25s ease;
          }

          .technician-main {
            transition: margin-left 0.25s ease;
          }

          .mobile-overlay {
            display: none;
          }

          .topbar-logout-button {
            border: 1px solid #e4e8ef;
            background: #ffffff;
            color: #d94b4b;
            padding: 9px 13px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s ease;
          }

          .topbar-logout-button:hover {
            background: #fff5f5;
            border-color: #f0caca;
          }

          @media (max-width: 1100px) {
            .technician-stats-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .technician-quick-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            }

            .technician-dashboard-grid {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 768px) {
            .technician-sidebar {
              width: 250px !important;
              transform: translateX(-100%);
              box-shadow: 8px 0 30px rgba(20, 40, 70, 0.15);
            }

            .technician-sidebar.mobile-open {
              transform: translateX(0);
            }

            .technician-main {
              margin-left: 0 !important;
              width: 100% !important;
            }

            .technician-topbar {
              height: 64px !important;
              padding: 0 16px !important;
            }

            .technician-mobile-menu {
              display: flex !important;
            }

            .technician-content {
              padding: 22px 16px !important;
            }

            .technician-welcome-row {
              align-items: flex-start !important;
              flex-direction: column !important;
              gap: 18px !important;
            }

            .technician-welcome-row > div:first-child {
              width: 100%;
            }

            .technician-heading {
              font-size: 26px !important;
            }

            .technician-primary-button {
              width: 100% !important;
              justify-content: center !important;
            }

            .technician-verification-banner {
              align-items: flex-start !important;
              flex-wrap: wrap !important;
              padding: 17px !important;
            }

            .technician-verification-text {
              min-width: 0;
              width: calc(100% - 70px);
            }

            .technician-verification-text p {
              line-height: 1.5 !important;
            }

            .technician-outline-button {
              width: 100% !important;
              justify-content: center !important;
              margin-top: 4px;
            }

            .technician-stats-grid {
              grid-template-columns: 1fr !important;
              gap: 12px !important;
            }

            .technician-dashboard-grid {
              grid-template-columns: 1fr !important;
              gap: 14px !important;
            }

            .technician-panel {
              padding: 17px !important;
              min-height: auto !important;
            }

            .technician-panel-header {
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .technician-text-button {
              padding: 0 !important;
            }

            .technician-quick-grid {
              grid-template-columns: 1fr !important;
              gap: 10px !important;
            }

            .technician-quick-card {
              width: 100% !important;
            }

            .technician-footer {
              padding: 17px 16px !important;
              flex-direction: column !important;
              gap: 6px !important;
            }

            .technician-profile-mini-text {
              display: none !important;
            }

            .technician-topbar-right {
              gap: 8px !important;
            }

            .technician-profile-avatar {
              width: 38px !important;
              height: 38px !important;
            }

            .topbar-logout-button {
              padding: 9px !important;
            }

            .topbar-logout-text {
              display: none;
            }

            .mobile-overlay {
              position: fixed;
              inset: 0;
              background: rgba(15, 23, 42, 0.35);
              z-index: 15;
            }

            .mobile-overlay.visible {
              display: block;
            }
          }

          @media (max-width: 480px) {
            .technician-content {
              padding: 18px 12px !important;
            }

            .technician-heading {
              font-size: 23px !important;
              line-height: 1.25 !important;
            }

            .technician-subheading {
              font-size: 13px !important;
              line-height: 1.5 !important;
            }

            .technician-verification-banner {
              gap: 12px !important;
            }

            .technician-verification-icon {
              width: 44px !important;
              height: 44px !important;
            }

            .technician-verification-title-row {
              flex-wrap: wrap !important;
            }

            .technician-verification-title {
              font-size: 16px !important;
            }

            .technician-stat-card {
              padding: 15px !important;
            }

            .technician-stat-value {
              font-size: 19px !important;
            }

            .technician-panel-title {
              font-size: 15px !important;
            }

            .technician-empty-state {
              padding: 20px 10px !important;
            }

            .technician-topbar {
              padding: 0 12px !important;
            }

            .topbar-logout-button {
              width: 38px;
              height: 38px;
              padding: 0 !important;
            }
          }
        `}
      </style>

      <div style={styles.page} className="technician-dashboard-page">
        <div
          className={`mobile-overlay ${
            mobileMenuOpen ? "visible" : ""
          }`}
          onClick={closeMobileMenu}
        />

        <aside
          style={styles.sidebar}
          className={`technician-sidebar ${
            mobileMenuOpen ? "mobile-open" : ""
          }`}
        >
          <div style={styles.sidebarTop}>
            <Link
              to="/"
              style={styles.logo}
              onClick={closeMobileMenu}
            >
              <div style={styles.logoIcon}>
                <Wrench size={21} />
              </div>

              <span>
                Pro<span style={styles.logoAccent}>Quire</span>
              </span>
            </Link>

            <nav style={styles.navigation}>
              <p style={styles.navTitle}>MAIN MENU</p>

              <Link
                to="/technician"
                style={{
                  ...styles.navItem,
                  ...styles.activeNavItem,
                }}
                onClick={closeMobileMenu}
              >
                <LayoutDashboard size={19} />
                Dashboard
              </Link>

              <Link
                to="/technician/profile"
                style={styles.navItem}
                onClick={closeMobileMenu}
              >
                <User size={19} />
                My Profile
              </Link>

              <Link
                to="/technician"
                style={styles.navItem}
                onClick={closeMobileMenu}
              >
                <ClipboardList size={19} />
                Service Requests
              </Link>

              <Link
                to="/technician"
                style={styles.navItem}
                onClick={closeMobileMenu}
              >
                <CalendarDays size={19} />
                Availability
              </Link>

              <Link
                to="/technician"
                style={styles.navItem}
                onClick={closeMobileMenu}
              >
                <BriefcaseBusiness size={19} />
                Portfolio
              </Link>

              <Link
                to="/technician"
                style={styles.navItem}
                onClick={closeMobileMenu}
              >
                <Star size={19} />
                Reviews
              </Link>

              <p
                style={{
                  ...styles.navTitle,
                  marginTop: "28px",
                }}
              >
                ACCOUNT
              </p>

              <Link
                to="/technician"
                style={styles.navItem}
                onClick={closeMobileMenu}
              >
                <CreditCard size={19} />
                Subscription
              </Link>

              <Link
                to="/technician"
                style={styles.navItem}
                onClick={closeMobileMenu}
              >
                <Settings size={19} />
                Settings
              </Link>
            </nav>
          </div>

          <div style={styles.sidebarBottom}>
            <div style={styles.sidebarHelp}>
              <ShieldCheck size={20} />

              <div>
                <strong>ProQuire Verified</strong>

                <span>Build trust with clients</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={styles.logoutButton}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        <main
          style={styles.main}
          className="technician-main"
        >
          <header
            style={styles.topbar}
            className="technician-topbar"
          >
            <div>
              <button
                style={styles.mobileMenu}
                className="technician-mobile-menu"
                onClick={() =>
                  setMobileMenuOpen(!mobileMenuOpen)
                }
                aria-label="Open navigation menu"
              >
                {mobileMenuOpen ? (
                  <X size={22} />
                ) : (
                  <Menu size={22} />
                )}
              </button>
            </div>

            <div
              style={styles.topbarRight}
              className="technician-topbar-right"
            >
              <button style={styles.iconButton}>
                <Bell size={20} />
                <span style={styles.notificationDot}></span>
              </button>

              <div style={styles.profileMini}>
                <div
                  style={styles.avatar}
                  className="technician-profile-avatar"
                >
                  {technicianName.charAt(0).toUpperCase()}
                </div>

                <div
                  style={styles.profileMiniText}
                  className="technician-profile-mini-text"
                >
                  <strong>{technicianName}</strong>

                  <span>Technician</span>
                </div>
              </div>

              <button
                className="topbar-logout-button"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={17} />
                <span className="topbar-logout-text">
                  Logout
                </span>
              </button>
            </div>
          </header>

          <section
            style={styles.content}
            className="technician-content"
          >
            <div
              style={styles.welcomeRow}
              className="technician-welcome-row"
            >
              <div>
                <p style={styles.pageLabel}>
                  TECHNICIAN DASHBOARD
                </p>

                <h1
                  style={styles.heading}
                  className="technician-heading"
                >
                  Welcome back,{" "}
                  {technicianName.split(" ")[0]}!
                </h1>

                <p
                  style={styles.subheading}
                  className="technician-subheading"
                >
                  Manage your professional profile,
                  requests and services from one place.
                </p>
              </div>

              <button
                style={styles.primaryButton}
                className="technician-primary-button"
                onClick={() =>
                  navigate("/technician/profile")
                }
              >
                <User size={18} />
                View Profile
              </button>
            </div>

            <div
              style={styles.verificationBanner}
              className="technician-verification-banner"
            >
              <div
                style={styles.verificationIcon}
                className="technician-verification-icon"
              >
                <ShieldCheck size={27} />
              </div>

              <div
                style={styles.verificationText}
                className="technician-verification-text"
              >
                <div
                  style={styles.verificationTitleRow}
                  className="technician-verification-title-row"
                >
                  <h3
                    style={styles.verificationTitle}
                    className="technician-verification-title"
                  >
                    Profile verification
                  </h3>

                  <span
                    style={
                      isVerified
                        ? styles.verifiedBadge
                        : styles.pendingBadge
                    }
                  >
                    {isVerified ? "Verified" : "Pending"}
                  </span>
                </div>

                <p>
                  {isVerified
                    ? "Your professional profile has been verified and is ready to build trust with clients."
                    : "Complete your professional profile and submit your documents for verification to build trust with potential clients."}
                </p>
              </div>

              {!isVerified && (
                <button
                  style={styles.outlineButton}
                  className="technician-outline-button"
                  onClick={() =>
                    navigate("/technician/profile")
                  }
                >
                  {isProfileComplete
                    ? "Submit Documents"
                    : "Complete Profile"}

                  <ArrowRight size={17} />
                </button>
              )}
            </div>

            <div
              style={styles.statsGrid}
              className="technician-stats-grid"
            >
              <div
                style={styles.statCard}
                className="technician-stat-card"
              >
                <div
                  style={{
                    ...styles.statIcon,
                    background: "#eaf2ff",
                    color: "#1769e0",
                  }}
                >
                  <ClipboardList size={21} />
                </div>

                <div>
                  <span style={styles.statLabel}>
                    Service Requests
                  </span>

                  <strong
                    style={styles.statValue}
                    className="technician-stat-value"
                  >
                    0
                  </strong>

                  <span style={styles.statDescription}>
                    No pending requests
                  </span>
                </div>
              </div>

              <div
                style={styles.statCard}
                className="technician-stat-card"
              >
                <div
                  style={{
                    ...styles.statIcon,
                    background: "#fff6df",
                    color: "#c58a00",
                  }}
                >
                  <Star size={21} />
                </div>

                <div>
                  <span style={styles.statLabel}>
                    Average Rating
                  </span>

                  <strong
                    style={styles.statValue}
                    className="technician-stat-value"
                  >
                    —
                  </strong>

                  <span style={styles.statDescription}>
                    No reviews yet
                  </span>
                </div>
              </div>

              <div
                style={styles.statCard}
                className="technician-stat-card"
              >
                <div
                  style={{
                    ...styles.statIcon,
                    background: "#eaf9f0",
                    color: "#159447",
                  }}
                >
                  <CalendarDays size={21} />
                </div>

                <div>
                  <span style={styles.statLabel}>
                    Availability
                  </span>

                  <strong
                    style={styles.statValue}
                    className="technician-stat-value"
                  >
                    Not Set
                  </strong>

                  <span style={styles.statDescription}>
                    Set your working hours
                  </span>
                </div>
              </div>

              <div
                style={styles.statCard}
                className="technician-stat-card"
              >
                <div
                  style={{
                    ...styles.statIcon,
                    background: "#f2edff",
                    color: "#7048c8",
                  }}
                >
                  <CreditCard size={21} />
                </div>

                <div>
                  <span style={styles.statLabel}>
                    Subscription
                  </span>

                  <strong
                    style={styles.statValue}
                    className="technician-stat-value"
                  >
                    Basic
                  </strong>

                  <span style={styles.statDescription}>
                    Manage your plan
                  </span>
                </div>
              </div>
            </div>

            <div
              style={styles.dashboardGrid}
              className="technician-dashboard-grid"
            >
              <div
                style={styles.panel}
                className="technician-panel"
              >
                <div
                  style={styles.panelHeader}
                  className="technician-panel-header"
                >
                  <div>
                    <h2
                      style={styles.panelTitle}
                      className="technician-panel-title"
                    >
                      Recent Service Requests
                    </h2>

                    <p style={styles.panelSubtitle}>
                      Requests from clients
                    </p>
                  </div>

                  <button
                    style={styles.textButton}
                    className="technician-text-button"
                  >
                    View All
                    <ArrowRight size={16} />
                  </button>
                </div>

                <div
                  style={styles.emptyState}
                  className="technician-empty-state"
                >
                  <div style={styles.emptyIcon}>
                    <ClipboardList size={25} />
                  </div>

                  <h3>No service requests yet</h3>

                  <p>
                    Client service requests will appear
                    here once your profile becomes
                    available to clients.
                  </p>
                </div>
              </div>

              <div
                style={styles.panel}
                className="technician-panel"
              >
                <div
                  style={styles.panelHeader}
                  className="technician-panel-header"
                >
                  <div>
                    <h2
                      style={styles.panelTitle}
                      className="technician-panel-title"
                    >
                      Profile Completion
                    </h2>

                    <p style={styles.panelSubtitle}>
                      Complete your profile to attract clients
                    </p>
                  </div>
                </div>

                <div style={styles.progressContainer}>
                  <div style={styles.progressHeader}>
                    <span>
                      {loadingProfile
                        ? "Loading profile..."
                        : "Profile progress"}
                    </span>

                    <strong>
                      {loadingProfile
                        ? "—"
                        : `${profileCompletion}%`}
                    </strong>
                  </div>

                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressBar,
                        width: `${profileCompletion}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div style={styles.checkList}>
                  <div style={styles.checkItem}>
                    <CheckCircle
                      size={18}
                      color="#1b9a50"
                    />

                    <span>Account created</span>
                  </div>

                  <div style={styles.checkItem}>
                    <CheckCircle
                      size={18}
                      color="#1b9a50"
                    />

                    <span>Email registered</span>
                  </div>

                  <div style={styles.checkItem}>
                    {technicianProfile &&
                    profileCompletion === 100 ? (
                      <CheckCircle
                        size={18}
                        color="#1b9a50"
                      />
                    ) : (
                      <Clock3
                        size={18}
                        color="#d18b00"
                      />
                    )}

                    <span>
                      Complete professional profile
                    </span>
                  </div>

                  <div style={styles.checkItem}>
                    {isVerified ? (
                      <CheckCircle
                        size={18}
                        color="#1b9a50"
                      />
                    ) : (
                      <AlertCircle
                        size={18}
                        color="#e05252"
                      />
                    )}

                    <span>
                      {isVerified
                        ? "Verification approved"
                        : "Submit verification documents"}
                    </span>
                  </div>
                </div>

                <button
                  style={styles.fullButton}
                  onClick={() =>
                    navigate("/technician/profile")
                  }
                >
                  {isProfileComplete
                    ? "View Profile"
                    : "Complete Profile"}

                  <ArrowRight size={17} />
                </button>
              </div>
            </div>

            <div style={styles.quickSection}>
              <div>
                <h2 style={styles.quickTitle}>
                  Quick Actions
                </h2>

                <p style={styles.quickSubtitle}>
                  Manage the most important parts of
                  your professional account.
                </p>
              </div>

              <div
                style={styles.quickGrid}
                className="technician-quick-grid"
              >
                <button
                  style={styles.quickCard}
                  className="technician-quick-card"
                  onClick={() =>
                    navigate("/technician/profile")
                  }
                >
                  <User
                    size={22}
                    color="#1769e0"
                  />

                  <div>
                    <strong>Edit Profile</strong>

                    <span>
                      Update your professional information
                    </span>
                  </div>

                  <ArrowRight size={17} />
                </button>

                <button
                  style={styles.quickCard}
                  className="technician-quick-card"
                  onClick={() =>
                    navigate("/technician")
                  }
                >
                  <CalendarDays
                    size={22}
                    color="#159447"
                  />

                  <div>
                    <strong>Set Availability</strong>

                    <span>
                      Manage your working hours
                    </span>
                  </div>

                  <ArrowRight size={17} />
                </button>

                <button
                  style={styles.quickCard}
                  className="technician-quick-card"
                  onClick={() =>
                    navigate("/technician")
                  }
                >
                  <BriefcaseBusiness
                    size={22}
                    color="#7048c8"
                  />

                  <div>
                    <strong>Manage Portfolio</strong>

                    <span>
                      Showcase your previous work
                    </span>
                  </div>

                  <ArrowRight size={17} />
                </button>

                <button
                  style={styles.quickCard}
                  className="technician-quick-card"
                  onClick={() =>
                    navigate("/technician")
                  }
                >
                  <CreditCard
                    size={22}
                    color="#c58a00"
                  />

                  <div>
                    <strong>Manage Subscription</strong>

                    <span>
                      View your subscription plan
                    </span>
                  </div>

                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </section>

          <footer
            style={styles.footer}
            className="technician-footer"
          >
            <span>
              © {new Date().getFullYear()} ProQuire
            </span>

            <span>
              Professional Service Marketplace
            </span>
          </footer>
        </main>
      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f8fc",
    color: "#172033",
    display: "flex",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  sidebar: {
    width: "250px",
    minHeight: "100vh",
    background: "#ffffff",
    borderRight: "1px solid #e7ebf2",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 20,
  },

  sidebarTop: {
    padding: "25px 17px",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    color: "#1769e0",
    fontSize: "25px",
    fontWeight: "800",
    padding: "0 9px",
    marginBottom: "38px",
  },

  logoIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "10px",
    background: "#1769e0",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logoAccent: {
    color: "#172033",
  },

  navigation: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  navTitle: {
    fontSize: "10px",
    fontWeight: "700",
    letterSpacing: "1px",
    color: "#98a1b2",
    margin: "0 10px 9px",
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
    padding: "12px 12px",
    borderRadius: "9px",
    textDecoration: "none",
    color: "#697386",
    fontSize: "14px",
    fontWeight: "500",
    transition: "0.2s",
  },

  activeNavItem: {
    background: "#eaf2ff",
    color: "#1769e0",
    fontWeight: "650",
  },

  sidebarBottom: {
    padding: "17px",
    borderTop: "1px solid #edf0f5",
  },

  sidebarHelp: {
    display: "flex",
    gap: "10px",
    padding: "13px",
    background: "#f4f8ff",
    borderRadius: "10px",
    color: "#1769e0",
    marginBottom: "13px",
  },

  logoutButton: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#697386",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "11px 12px",
    cursor: "pointer",
    fontSize: "14px",
  },

  main: {
    marginLeft: "250px",
    width: "calc(100% - 250px)",
    minHeight: "100vh",
  },

  topbar: {
    height: "74px",
    background: "#ffffff",
    borderBottom: "1px solid #e7ebf2",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 34px",
  },

  mobileMenu: {
    display: "none",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "#172033",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
  },

  topbarRight: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },

  iconButton: {
    width: "40px",
    height: "40px",
    border: "1px solid #e6eaf0",
    borderRadius: "50%",
    background: "#ffffff",
    color: "#596579",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    cursor: "pointer",
  },

  notificationDot: {
    position: "absolute",
    top: "8px",
    right: "8px",
    width: "7px",
    height: "7px",
    background: "#e05252",
    borderRadius: "50%",
    border: "2px solid #ffffff",
  },

  profileMini: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  avatar: {
    width: "39px",
    height: "39px",
    borderRadius: "50%",
    background: "#1769e0",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "16px",
    flexShrink: 0,
  },

  profileMiniText: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },

  content: {
    maxWidth: "1450px",
    margin: "0 auto",
    padding: "34px",
  },

  welcomeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "25px",
    marginBottom: "27px",
  },

  pageLabel: {
    color: "#1769e0",
    fontSize: "11px",
    fontWeight: "750",
    letterSpacing: "1.2px",
    margin: "0 0 7px",
  },

  heading: {
    margin: "0",
    fontSize: "30px",
    lineHeight: "1.2",
    color: "#172033",
  },

  subheading: {
    margin: "8px 0 0",
    color: "#7a8496",
    fontSize: "14px",
  },

  primaryButton: {
    border: "none",
    background: "#1769e0",
    color: "#ffffff",
    padding: "12px 18px",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  verificationBanner: {
    background: "#ffffff",
    border: "1px solid #dbe7fb",
    borderLeft: "4px solid #1769e0",
    borderRadius: "11px",
    padding: "19px 21px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "25px",
    boxShadow: "0 2px 8px rgba(25, 65, 120, 0.03)",
  },

  verificationIcon: {
    width: "49px",
    height: "49px",
    borderRadius: "11px",
    background: "#eaf2ff",
    color: "#1769e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  verificationText: {
    flex: 1,
    minWidth: 0,
  },

  verificationTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
  },

  verificationTitle: {
    margin: 0,
  },

  pendingBadge: {
    background: "#fff5dc",
    color: "#a87300",
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 8px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },

  verifiedBadge: {
    background: "#eaf9f0",
    color: "#159447",
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 8px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },

  outlineButton: {
    background: "#ffffff",
    color: "#1769e0",
    border: "1px solid #bcd2f4",
    padding: "10px 14px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "17px",
    marginBottom: "25px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "11px",
    padding: "19px",
    display: "flex",
    gap: "14px",
    alignItems: "center",
    boxShadow:
      "0 2px 7px rgba(20, 40, 70, 0.025)",
    minWidth: 0,
  },

  statIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  statLabel: {
    display: "block",
    color: "#7a8496",
    fontSize: "12px",
    marginBottom: "4px",
  },

  statValue: {
    display: "block",
    color: "#172033",
    fontSize: "21px",
    marginBottom: "3px",
  },

  statDescription: {
    display: "block",
    color: "#9aa2b1",
    fontSize: "11px",
  },

  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "1.35fr 1fr",
    gap: "20px",
    marginBottom: "28px",
  },

  panel: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "11px",
    padding: "22px",
    minHeight: "300px",
    minWidth: 0,
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "15px",
    paddingBottom: "18px",
    borderBottom: "1px solid #edf0f5",
  },

  panelTitle: {
    margin: 0,
    fontSize: "16px",
    color: "#172033",
  },

  panelSubtitle: {
    margin: "5px 0 0",
    color: "#8a93a3",
    fontSize: "12px",
  },

  textButton: {
    background: "transparent",
    border: "none",
    color: "#1769e0",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  },

  emptyState: {
    minHeight: "210px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    textAlign: "center",
    padding: "25px",
  },

  emptyIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "#f1f5fa",
    color: "#8090a5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "11px",
  },

  progressContainer: {
    marginTop: "23px",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#6f7889",
    marginBottom: "9px",
  },

  progressTrack: {
    width: "100%",
    height: "8px",
    borderRadius: "10px",
    background: "#e9edf3",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    background: "#1769e0",
    borderRadius: "10px",
    transition: "width 0.4s ease",
  },

  checkList: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  checkItem: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    fontSize: "13px",
    color: "#596579",
  },

  fullButton: {
    marginTop: "21px",
    width: "100%",
    background: "#1769e0",
    border: "none",
    borderRadius: "8px",
    color: "#ffffff",
    padding: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },

  quickSection: {
    marginBottom: "30px",
  },

  quickTitle: {
    margin: "0",
    fontSize: "18px",
    color: "#172033",
  },

  quickSubtitle: {
    margin: "5px 0 16px",
    color: "#8a93a3",
    fontSize: "13px",
  },

  quickGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: "14px",
  },

  quickCard: {
    background: "#ffffff",
    border: "1px solid #e7ebf2",
    borderRadius: "10px",
    padding: "17px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    textAlign: "left",
    cursor: "pointer",
    color: "#172033",
    minWidth: 0,
  },

  footer: {
    borderTop: "1px solid #e7ebf2",
    background: "#ffffff",
    padding: "19px 34px",
    display: "flex",
    justifyContent: "space-between",
    color: "#98a1b2",
    fontSize: "11px",
  },
};

export default TechnicianDashboard;