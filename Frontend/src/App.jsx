import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import {
  Search,
  ShieldCheck,
  Clock3,
  Star,
  ArrowRight,
  MapPin,
  Wrench,
} from "lucide-react";

import logo from "./assets/proquire-logo.png";

import Login from "./pages/Login";
import Register from "./pages/Register";
import RoleSelection from "./pages/RoleSelection";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import TechnicianProfile from "./pages/TechnicianProfile";
import AgencyRegister from "./pages/AgencyRegister";
import AgencyProfileSetup from "./pages/AgencyProfileSetup";
import AgencyDashboard from "./pages/AgencyDashboard";
import AgencyTechnicians from "./pages/AgencyTechnicians";
import AgencyTechnicianDetails from "./pages/AgencyTechnicianDetails";

import "./App.css";


/* =========================================================
   HOME PAGE
========================================================= */

function Home() {
  return (
    <div className="proquire-app">

      {/* =========================
          NAVIGATION
      ========================= */}
      <nav className="navbar">

        <div className="navbar-container">

          <Link to="/" className="navbar-logo">
            <img
              src={logo}
              alt="ProQuire Logo"
            />
          </Link>

          <div className="nav-links">

            <a href="#home">
              Home
            </a>

            <a href="#services">
              Services
            </a>

            <a href="#how-it-works">
              How It Works
            </a>

            <a href="#about">
              About
            </a>

          </div>

          <div className="nav-actions">

            <Link
              to="/role-selection"
              className="login-button"
            >
              Log In
            </Link>

            <Link
              to="/role-selection"
              className="signup-button"
            >
              Get Started
            </Link>

          </div>

        </div>

      </nav>


      {/* =========================
          HERO
      ========================= */}
      <section
        className="hero"
        id="home"
      >

        <div className="hero-container">

          <div className="hero-content">

            <div className="hero-badge">

              <ShieldCheck size={18} />

              Trusted Skilled Professionals

            </div>

            <h1>

              Find the Right

              <span>
                {" "}Technician{" "}
              </span>

              for the Job

            </h1>

            <p>
              Connect with verified skilled technicians and service
              agencies for reliable, professional services.
            </p>

            <div className="hero-buttons">

              <Link
                to="/role-selection"
                className="primary-button"
              >

                Find a Professional

                <ArrowRight size={18} />

              </Link>

              <Link
                to="/role-selection"
                className="secondary-button"
              >
                Join as a Professional
              </Link>

            </div>

            <div className="hero-trust">

              <div className="trust-item">

                <ShieldCheck size={16} />

                Verified Professionals

              </div>

              <div className="trust-item">

                <Star size={16} />

                Trusted Reviews

              </div>

              <div className="trust-item">

                <Clock3 size={16} />

                Save Time

              </div>

            </div>

          </div>


          {/* =========================
              SEARCH CARD
          ========================= */}
          <div className="hero-card-wrapper">

            <div className="hero-card">

              <div className="hero-card-header">

                <div>

                  <div className="small-label">
                    FIND A PROFESSIONAL
                  </div>

                  <h3>
                    What service do you need?
                  </h3>

                </div>

                <Wrench size={25} />

              </div>

              <div className="search-box">

                <Search size={19} />

                <span>
                  Search for a service
                </span>

              </div>

              <div className="search-box">

                <MapPin size={19} />

                <span>
                  Your location
                </span>

              </div>

              <Link
                to="/role-selection"
                className="search-button"
              >

                Search Professionals

                <ArrowRight size={18} />

              </Link>

              <div className="rating-preview">

                <div className="stars">

                  <Star
                    size={14}
                    fill="currentColor"
                  />

                  <Star
                    size={14}
                    fill="currentColor"
                  />

                  <Star
                    size={14}
                    fill="currentColor"
                  />

                  <Star
                    size={14}
                    fill="currentColor"
                  />

                  <Star
                    size={14}
                    fill="currentColor"
                  />

                </div>

                <span>
                  Find trusted professionals through ratings and reviews
                </span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          SERVICES
      ========================= */}
      <section
        className="services-section"
        id="services"
      >

        <div className="section-container">

          <div className="section-heading">

            <span className="section-label">
              OUR SERVICES
            </span>

            <h2>
              Professional Services You Can{" "}
              <span>Trust</span>
            </h2>

            <p>
              Find skilled professionals across a wide range of
              service categories.
            </p>

          </div>

          <div className="service-cards">

            <div className="service-card">

              <div className="service-icon">
                🔧
              </div>

              <h3>
                Plumbing
              </h3>

              <p>
                Find qualified plumbers for installation, repair
                and maintenance.
              </p>

              <button>
                Find Professionals
                <ArrowRight size={15} />
              </button>

            </div>

            <div className="service-card">

              <div className="service-icon">
                ⚡
              </div>

              <h3>
                Electrical
              </h3>

              <p>
                Connect with professional electricians for safe
                electrical work.
              </p>

              <button>
                Find Professionals
                <ArrowRight size={15} />
              </button>

            </div>

            <div className="service-card">

              <div className="service-icon">
                🏗️
              </div>

              <h3>
                Construction
              </h3>

              <p>
                Get skilled construction professionals for your
                projects.
              </p>

              <button>
                Find Professionals
                <ArrowRight size={15} />
              </button>

            </div>

            <div className="service-card">

              <div className="service-icon">
                🛠️
              </div>

              <h3>
                Mechanical
              </h3>

              <p>
                Find experienced mechanics for vehicle and
                equipment repairs.
              </p>

              <button>
                Find Professionals
                <ArrowRight size={15} />
              </button>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          HOW IT WORKS
      ========================= */}
      <section
        className="how-section"
        id="how-it-works"
      >

        <div className="section-container">

          <div className="section-heading">

            <span className="section-label">
              HOW IT WORKS
            </span>

            <h2>
              Get Your Problem Solved in{" "}
              <span>4 Simple Steps</span>
            </h2>

            <p>
              Finding the right professional is simple with ProQuire.
            </p>

          </div>

          <div className="steps">

            <div className="step">

              <div className="step-number">
                01
              </div>

              <h3>
                Search
              </h3>

              <p>
                Search for the service you need and choose your
                location.
              </p>

            </div>

            <div className="step">

              <div className="step-number">
                02
              </div>

              <h3>
                Compare
              </h3>

              <p>
                Compare verified technicians based on experience,
                ratings and reviews.
              </p>

            </div>

            <div className="step">

              <div className="step-number">
                03
              </div>

              <h3>
                Request
              </h3>

              <p>
                Send a service request to the professional that
                fits your needs.
              </p>

            </div>

            <div className="step">

              <div className="step-number">
                04
              </div>

              <h3>
                Get It Done
              </h3>

              <p>
                Work with your chosen professional and get your
                job completed.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =========================
          PROFESSIONAL CTA
      ========================= */}
      <section className="professional-section">

        <div className="professional-container">

          <div>

            <span className="section-label light">
              ARE YOU A PROFESSIONAL?
            </span>

            <h2>
              Grow Your Business with ProQuire
            </h2>

            <p>
              Join our platform and connect with clients looking
              for your skills and expertise.
            </p>

          </div>

          <Link
            to="/role-selection"
            className="light-button"
          >

            Join ProQuire

            <ArrowRight size={18} />

          </Link>

        </div>

      </section>


      {/* =========================
          ABOUT
      ========================= */}
      <section
        className="about-section"
        id="about"
      >

        <div className="section-container">

          <div className="section-heading">

            <span className="section-label">
              ABOUT PROQUIRE
            </span>

            <h2>
              Connecting People With{" "}
              <span>Trusted Professionals</span>
            </h2>

          </div>

          <div className="about-content">

            <h2>
              Making it easier to find the right professional
              for every job.
            </h2>

            <p>
              ProQuire makes it easier for clients to find skilled
              and verified technicians while helping professionals
              reach more customers. The platform brings clients,
              technicians and service agencies together in one
              convenient marketplace.
            </p>

          </div>

        </div>

      </section>


      {/* =========================
          FOOTER
      ========================= */}
      <footer className="footer">

        <div className="footer-container">

          <div className="footer-brand">

            <img
              src={logo}
              alt="ProQuire Logo"
              className="footer-logo"
            />

            <p>
              Connecting clients with skilled technicians and
              service professionals.
            </p>

          </div>

          <div className="footer-links">

            <a href="#home">
              Home
            </a>

            <a href="#services">
              Services
            </a>

            <a href="#how-it-works">
              How It Works
            </a>

            <a href="#about">
              About
            </a>

            <Link to="/login">
              Professional Login
            </Link>

          </div>

        </div>

        <div className="footer-bottom">

          <p>
            © 2026 ProQuire. All rights reserved.
          </p>

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   APP ROUTER
========================================================= */

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Landing Page */}
        <Route
          path="/"
          element={<Home />}
        />


        {/* Role Selection */}
        <Route
          path="/role-selection"
          element={<RoleSelection />}
        />


        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />


        {/* Registration */}
        <Route
          path="/register"
          element={<Register />}
        />


        {/* Admin */}
        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />


        {/* Technician */}
        <Route
          path="/technician"
          element={<TechnicianDashboard />}
        />

        <Route
          path="/technician/profile"
          element={<TechnicianProfile />}
        />


        {/* Agency Registration */}
        <Route
          path="/agency-register"
          element={<AgencyRegister />}
        />


        {/* Agency Profile Setup */}
        <Route
          path="/agency/profile-setup"
          element={<AgencyProfileSetup />}
        />


        {/* Agency Dashboard */}
        <Route
          path="/agency"
          element={<AgencyDashboard />}
        />

        <Route
           path="/agency/technicians"
           element={<AgencyTechnicians />}
         />

         <Route
          path="/agency/technicians/:id"
          element={<AgencyTechnicianDetails />}
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;