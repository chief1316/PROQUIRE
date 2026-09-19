import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Wrench,
} from "lucide-react";


function TechnicianDashboard() {
  const navigate = useNavigate();

  /*
   * Get the logged-in user's information from Local Storage.
   * This was saved by Login.jsx after successful authentication.
   */
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
    "Technician";

  const email =
    user.email ||
    "technician@proquire.com";

  /*
   * Logout
   */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");

    navigate("/login");
  };


  return (
    <div style={styles.page}>

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside style={styles.sidebar}>

        <div style={styles.sidebarTop}>

          {/* Logo */}
          <Link to="/" style={styles.logo}>
            <div style={styles.logoIcon}>
              <Wrench size={21} />
            </div>

            <span>
              Pro<span style={styles.logoAccent}>Quire</span>
            </span>
          </Link>


          {/* Navigation */}

          <nav style={styles.navigation}>

            <p style={styles.navTitle}>
              MAIN MENU
            </p>

            <Link
              to="/technician"
              style={{
                ...styles.navItem,
                ...styles.activeNavItem,
              }}
            >
              <LayoutDashboard size={19} />
              Dashboard
            </Link>


            <Link
              to="/technician"
              style={styles.navItem}
            >
              <User size={19} />
              My Profile
            </Link>


            <Link
              to="/technician"
              style={styles.navItem}
            >
              <ClipboardList size={19} />
              Service Requests
            </Link>


            <Link
              to="/technician"
              style={styles.navItem}
            >
              <CalendarDays size={19} />
              Availability
            </Link>


            <Link
              to="/technician"
              style={styles.navItem}
            >
              <BriefcaseBusiness size={19} />
              Portfolio
            </Link>


            <Link
              to="/technician"
              style={styles.navItem}
            >
              <Star size={19} />
              Reviews
            </Link>


            <p style={{
              ...styles.navTitle,
              marginTop: "28px",
            }}>
              ACCOUNT
            </p>


            <Link
              to="/technician"
              style={styles.navItem}
            >
              <CreditCard size={19} />
              Subscription
            </Link>


            <Link
              to="/technician"
              style={styles.navItem}
            >
              <Settings size={19} />
              Settings
            </Link>

          </nav>

        </div>


        {/* Sidebar bottom */}

        <div style={styles.sidebarBottom}>

          <div style={styles.sidebarHelp}>

            <ShieldCheck size={20} />

            <div>
              <strong>
                ProQuire Verified
              </strong>

              <span>
                Build trust with clients
              </span>
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


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main style={styles.main}>

        {/* ===================================================
            TOP BAR
        ==================================================== */}

        <header style={styles.topbar}>

          <div>

            <button style={styles.mobileMenu}>
              <Menu size={22} />
            </button>

          </div>


          <div style={styles.topbarRight}>

            <button style={styles.iconButton}>
              <Bell size={20} />
              <span style={styles.notificationDot}></span>
            </button>


            <div style={styles.profileMini}>

              <div style={styles.avatar}>
                {technicianName.charAt(0).toUpperCase()}
              </div>

              <div style={styles.profileMiniText}>

                <strong>
                  {technicianName}
                </strong>

                <span>
                  Technician
                </span>

              </div>

            </div>

          </div>

        </header>


        {/* ===================================================
            DASHBOARD CONTENT
        ==================================================== */}

        <section style={styles.content}>

          {/* Welcome */}

          <div style={styles.welcomeRow}>

            <div>

              <p style={styles.pageLabel}>
                TECHNICIAN DASHBOARD
              </p>

              <h1 style={styles.heading}>
                Welcome back, {technicianName.split(" ")[0]}!
              </h1>

              <p style={styles.subheading}>
                Manage your professional profile, requests and
                services from one place.
              </p>

            </div>


            <button
              style={styles.primaryButton}
              onClick={() => navigate("/technician")}
            >
              <User size={18} />
              View Profile
            </button>

          </div>


          {/* =================================================
              PROFILE / VERIFICATION BANNER
          ================================================== */}

          <div style={styles.verificationBanner}>

            <div style={styles.verificationIcon}>
              <ShieldCheck size={27} />
            </div>


            <div style={styles.verificationText}>

              <div style={styles.verificationTitleRow}>

                <h3 style={styles.verificationTitle}>
                  Profile verification
                </h3>

                <span style={styles.pendingBadge}>
                  Pending
                </span>

              </div>

              <p>
                Complete your professional profile and submit
                your documents for verification to build trust
                with potential clients.
              </p>

            </div>


            <button
              style={styles.outlineButton}
              onClick={() => navigate("/technician")}
            >
              Complete Profile
              <ArrowRight size={17} />
            </button>

          </div>


          {/* =================================================
              STATISTICS
          ================================================== */}

          <div style={styles.statsGrid}>

            <div style={styles.statCard}>

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

                <strong style={styles.statValue}>
                  0
                </strong>

                <span style={styles.statDescription}>
                  No pending requests
                </span>
              </div>

            </div>


            <div style={styles.statCard}>

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

                <strong style={styles.statValue}>
                  —
                </strong>

                <span style={styles.statDescription}>
                  No reviews yet
                </span>
              </div>

            </div>


            <div style={styles.statCard}>

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

                <strong style={styles.statValue}>
                  Not Set
                </strong>

                <span style={styles.statDescription}>
                  Set your working hours
                </span>
              </div>

            </div>


            <div style={styles.statCard}>

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

                <strong style={styles.statValue}>
                  Basic
                </strong>

                <span style={styles.statDescription}>
                  Manage your plan
                </span>
              </div>

            </div>

          </div>


          {/* =================================================
              LOWER GRID
          ================================================== */}

          <div style={styles.dashboardGrid}>

            {/* Recent Requests */}

            <div style={styles.panel}>

              <div style={styles.panelHeader}>

                <div>

                  <h2 style={styles.panelTitle}>
                    Recent Service Requests
                  </h2>

                  <p style={styles.panelSubtitle}>
                    Requests from clients
                  </p>

                </div>


                <button style={styles.textButton}>
                  View All
                  <ArrowRight size={16} />
                </button>

              </div>


              <div style={styles.emptyState}>

                <div style={styles.emptyIcon}>
                  <ClipboardList size={25} />
                </div>

                <h3>
                  No service requests yet
                </h3>

                <p>
                  Client service requests will appear here once
                  your profile becomes available to clients.
                </p>

              </div>

            </div>


            {/* Profile Completion */}

            <div style={styles.panel}>

              <div style={styles.panelHeader}>

                <div>

                  <h2 style={styles.panelTitle}>
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
                    Profile progress
                  </span>

                  <strong>
                    25%
                  </strong>

                </div>


                <div style={styles.progressTrack}>

                  <div
                    style={{
                      ...styles.progressBar,
                      width: "25%",
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

                  <span>
                    Account created
                  </span>

                </div>


                <div style={styles.checkItem}>

                  <CheckCircle
                    size={18}
                    color="#1b9a50"
                  />

                  <span>
                    Email registered
                  </span>

                </div>


                <div style={styles.checkItem}>

                  <Clock3
                    size={18}
                    color="#d18b00"
                  />

                  <span>
                    Complete professional profile
                  </span>

                </div>


                <div style={styles.checkItem}>

                  <AlertCircle
                    size={18}
                    color="#e05252"
                  />

                  <span>
                    Submit verification documents
                  </span>

                </div>

              </div>


              <button
                style={styles.fullButton}
                onClick={() => navigate("/technician")}
              >
                Complete Profile
                <ArrowRight size={17} />
              </button>

            </div>

          </div>


          {/* =================================================
              QUICK ACTIONS
          ================================================== */}

          <div style={styles.quickSection}>

            <div>

              <h2 style={styles.quickTitle}>
                Quick Actions
              </h2>

              <p style={styles.quickSubtitle}>
                Manage the most important parts of your professional
                account.
              </p>

            </div>


            <div style={styles.quickGrid}>

              <button style={styles.quickCard}>

                <User
                  size={22}
                  color="#1769e0"
                />

                <div>
                  <strong>
                    Edit Profile
                  </strong>

                  <span>
                    Update your professional information
                  </span>
                </div>

                <ArrowRight size={17} />

              </button>


              <button style={styles.quickCard}>

                <CalendarDays
                  size={22}
                  color="#159447"
                />

                <div>
                  <strong>
                    Set Availability
                  </strong>

                  <span>
                    Manage your working hours
                  </span>
                </div>

                <ArrowRight size={17} />

              </button>


              <button style={styles.quickCard}>

                <BriefcaseBusiness
                  size={22}
                  color="#7048c8"
                />

                <div>
                  <strong>
                    Manage Portfolio
                  </strong>

                  <span>
                    Showcase your previous work
                  </span>
                </div>

                <ArrowRight size={17} />

              </button>


              <button style={styles.quickCard}>

                <CreditCard
                  size={22}
                  color="#c58a00"
                />

                <div>
                  <strong>
                    Manage Subscription
                  </strong>

                  <span>
                    View your subscription plan
                  </span>
                </div>

                <ArrowRight size={17} />

              </button>

            </div>

          </div>

        </section>


        {/* ===================================================
            FOOTER
        ==================================================== */}

        <footer style={styles.footer}>

          <span>
            © {new Date().getFullYear()} ProQuire
          </span>

          <span>
            AI-Assisted Professional Service Marketplace
          </span>

        </footer>

      </main>

    </div>
  );
}


/* =========================================================
   INLINE STYLES
========================================================= */

const styles = {

  page: {
    minHeight: "100vh",
    background: "#f5f8fc",
    color: "#172033",
    display: "flex",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },


  /* ================= SIDEBAR ================= */

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


  /* ================= MAIN ================= */

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
    gap: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },


  /* ================= VERIFICATION ================= */

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
  },


  outlineButton: {
    background: "#ffffff",
    color: "#1769e0",
    border: "1px solid #bcd2f4",
    padding: "10px 14px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },


  /* ================= STATS ================= */

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
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
    boxShadow: "0 2px 7px rgba(20, 40, 70, 0.025)",
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


  /* ================= PANELS ================= */

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


  /* ================= QUICK ACTIONS ================= */

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
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
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
  },


  /* ================= FOOTER ================= */

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