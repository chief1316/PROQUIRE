import {
  Users,
  Wrench,
  Building2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import logo from "../assets/proquire-logo.png";

function RoleSelection() {
  return (
    <div className="role-selection-page">

      {/* =========================
          HEADER
      ========================= */}
      <header className="role-header">
        <a href="/" className="role-logo">
          <img src={logo} alt="ProQuire Logo" />
        </a>
      </header>


      {/* =========================
          MAIN CONTENT
      ========================= */}
      <main className="role-main">

        <div className="role-container">

          <div className="role-heading">

            <div className="role-badge">
              <ShieldCheck size={18} />
              Secure Access
            </div>

            <h1>
              Welcome to <span>ProQuire</span>
            </h1>

            <p>
              Choose how you want to use ProQuire to continue.
            </p>

          </div>


          {/* =========================
              ROLE CARDS
          ========================= */}
          <div className="role-cards">

            {/* CLIENT */}
            <a
              href="/login?role=client"
              className="role-card"
            >
              <div className="role-icon client-icon">
                <Users size={30} />
              </div>

              <div className="role-card-content">
                <h2>Client</h2>

                <p>
                  Find skilled technicians and service agencies,
                  compare professionals and request services.
                </p>

                <span className="role-card-link">
                  Continue as Client
                  <ArrowRight size={17} />
                </span>
              </div>
            </a>


            {/* TECHNICIAN */}
            <a
              href="/login?role=technician"
              className="role-card"
            >
              <div className="role-icon technician-icon">
                <Wrench size={30} />
              </div>

              <div className="role-card-content">
                <h2>Technician</h2>

                <p>
                  Create your professional profile, showcase your
                  skills and connect with clients.
                </p>

                <span className="role-card-link">
                  Continue as Technician
                  <ArrowRight size={17} />
                </span>
              </div>
            </a>


            {/* AGENCY */}
            <a
              href="/login?role=agency"
              className="role-card"
            >
              <div className="role-icon agency-icon">
                <Building2 size={30} />
              </div>

              <div className="role-card-content">
                <h2>Agency</h2>

                <p>
                  Register your service agency, manage technicians
                  and handle service requests.
                </p>

                <span className="role-card-link">
                  Continue as Agency
                  <ArrowRight size={17} />
                </span>
              </div>
            </a>

          </div>


          {/* =========================
              ADMIN LOGIN
          ========================= */}
          <div className="admin-login-section">

            <div className="admin-divider">
              <span></span>
              <p>Platform Administration</p>
              <span></span>
            </div>

            <a
              href="/admin-login"
              className="admin-login-button"
            >
              <ShieldCheck size={18} />
              Admin Login
              <ArrowRight size={17} />
            </a>

            <p className="admin-note">
              Administrator access is restricted to authorized
              ProQuire administrators.
            </p>

          </div>


          {/* =========================
              BACK TO HOME
          ========================= */}
          <a href="/" className="back-home">
            ← Back to ProQuire
          </a>

        </div>

      </main>

    </div>
  );
}

export default RoleSelection;