import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import {
  Search,
  ShieldCheck,
  Clock3,
  Star,
  ArrowRight,
  MapPin,
  Wrench,
  Mail,
  Phone,
  Camera,
} from "lucide-react";

import logo from "./assets/proquire-logo.png";

import heroTechnicians from "./assets/proquire-hero-technicians.png";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import RoleSelection from "./pages/RoleSelection";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import TechnicianProfile from "./pages/TechnicianProfile";
import AgencyRegister from "./pages/AgencyRegister";
import AgencyProfileSetup from "./pages/AgencyProfileSetup";
import AgencyProfile from "./pages/AgencyProfile";
import AgencyDashboard from "./pages/AgencyDashboard";
import AgencyTechnicians from "./pages/AgencyTechnicians";
import AgencyTechnicianDetails from "./pages/AgencyTechnicianDetails";
import AgencyServiceRequests from "./pages/AgencyServiceRequests";
import AgencySubscription from "./pages/agency/AgencySubscription";
import AgencyReports from "./pages/agency/AgencyReports";
import AgencySettings from "./pages/agency/AgencySettings";

import ClientDashboard from "./pages/ClientDashboard";
import ClientSettings from "./pages/ClientSettings";
import Availability from "./pages/technician/Availability";
import TechnicianPortfolio from "./pages/technician/TechnicianPortfolio";
import TechnicianVerification from "./pages/technician/TechnicianVerification";
import TechnicianSubscription from "./pages/technician/TechnicianSubscription";
import TechnicianSettings from "./pages/technician/TechnicianSettings";

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
            <img src={logo} alt="ProQuire Logo" />
          </Link>

          <div className="nav-links">
            <a href="#home">Home</a>

            <a href="#services">Services</a>

            <a href="#how-it-works">How It Works</a>

            <a href="#about">About</a>
          </div>

          <div className="nav-actions">
            <Link to="/role-selection" className="signup-button">
              LOGIN/SIGNUP
            </Link>
          </div>
        </div>
      </nav>

      {/* =========================
          HERO
      ========================= */}
      <section className="hero" id="home">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <ShieldCheck size={18} />
              Trusted Skilled Professionals
            </div>

            <h1>
              Find the Right
              <span> Technician </span>
              for the Job
            </h1>

            <p>
              Connect with verified skilled technicians and service agencies for
              reliable, professional services.
            </p>

            <div className="hero-buttons">
              <Link to="/role-selection" className="primary-button">
                Find a Professional
                <ArrowRight size={18} />
              </Link>

              <Link to="/role-selection" className="secondary-button">
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
          <div className="hero-visual">
            <img
              src={heroTechnicians}
              alt="Male and female ProQuire technicians"
              className="hero-technicians-image"
            />
          </div>
        </div>
      </section>

      {/* =========================
          SERVICES
      ========================= */}
      <section className="services-section" id="services">
        <div className="section-container">
          <div className="section-heading">
            <span className="section-label">OUR SERVICES</span>

            <h2>
              Explore Our <span>Services</span>
            </h2>

            <p>
              From everyday repairs to major projects, find the right
              professional for your needs.
            </p>
          </div>

          <div className="service-cards">
            <Link to="/role-selection" className="service-card">
              <div className="service-icon">🔧</div>
              <h3>Plumbing</h3>
              <p>Installation, repairs and maintenance.</p>
            </Link>

            <Link to="/role-selection" className="service-card">
              <div className="service-icon">⚡</div>
              <h3>Electrical</h3>
              <p>Electrical installation and repairs.</p>
            </Link>

            <Link to="/role-selection" className="service-card">
              <div className="service-icon">🏗️</div>
              <h3>Construction</h3>
              <p>Building and construction projects.</p>
            </Link>

            <Link to="/role-selection" className="service-card">
              <div className="service-icon">🛠️</div>
              <h3>Mechanical</h3>
              <p>Vehicle and equipment repairs.</p>
            </Link>
          </div>

          <div className="services-more">
            <h3>Looking for something else?</h3>

            <p>
              These are just some of the services available on ProQuire.
              Discover more skilled professionals across different service
              categories.
            </p>

            <Link to="/role-selection" className="services-explore-button">
              Explore More Services
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* =========================
          HOW IT WORKS
      ========================= */}
      <section className="how-section" id="how-it-works">
        <div className="section-container">
          <div className="section-heading">
            <span className="section-label">HOW IT WORKS</span>

            <h2>
              Get Your Problem Solved in <span>4 Simple Steps</span>
            </h2>

            <p>Finding the right professional is simple with ProQuire.</p>
          </div>

          <div className="steps">
            <div className="step">
              <div className="step-number">01</div>

              <h3>Search</h3>

              <p>Search for the service you need and choose your location.</p>
            </div>

            <div className="step">
              <div className="step-number">02</div>

              <h3>Compare</h3>

              <p>
                Compare verified technicians based on experience, ratings and
                reviews.
              </p>
            </div>

            <div className="step">
              <div className="step-number">03</div>

              <h3>Request</h3>

              <p>
                Send a service request to the professional that fits your needs.
              </p>
            </div>

            <div className="step">
              <div className="step-number">04</div>

              <h3>Get It Done</h3>

              <p>
                Work with your chosen professional and get your job completed.
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
            <span className="section-label light">ARE YOU A PROFESSIONAL?</span>

            <h2>Grow Your Business with ProQuire</h2>

            <p>
              Join our platform and connect with clients looking for your skills
              and expertise.
            </p>
          </div>

          <Link to="/role-selection" className="light-button">
            Join ProQuire
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* =========================
          ABOUT
      ========================= */}
      <section className="about-section" id="about">
        <div className="section-container">
          <div className="section-heading">
            <span className="section-label">ABOUT PROQUIRE</span>

            <h2>
              Connecting People With <span>Trusted Professionals</span>
            </h2>
          </div>

          <div className="about-content">
            <h2>
              Making it easier to find the right professional for every job.
            </h2>

            <p>
              ProQuire makes it easier for clients to find skilled and verified
              technicians while helping professionals reach more customers. The
              platform brings clients, technicians and service agencies together
              in one convenient marketplace.
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
            <img src={logo} alt="ProQuire Logo" className="footer-logo" />

            <p>
              Connecting clients with skilled technicians and service
              professionals.
            </p>
          </div>

          <div className="footer-links">
            <h3>Quick Links</h3>
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#about">About</a>
            <Link to="/login">Professional Login</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>

            <Link to="/terms-of-service">Terms of Service</Link>
          </div>

          <div className="footer-contact">
            <h3>Contact Us</h3>

            <a href="mailto:proquire.est2026@gmail.com">
              <Mail size={17} />
              proquire.est2026@gmail.com
            </a>

            <a href="tel:+254757641698">
              <Phone size={17} />
              0757641698
            </a>
          </div>

          <div className="footer-socials">
            <h3>Follow Us</h3>

            <a
              href="https://www.instagram.com/proquire_?lqvp=YmJocnB5MWk0ZGtz"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Camera size={19} />
              Instagram
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 ProQuire. All rights reserved.</p>
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
        <Route path="/" element={<Home />} />

        {/* Legal Documents */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        {/* Role Selection */}
        <Route path="/role-selection" element={<RoleSelection />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Registration */}
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/admin" element={<AdminDashboard />} />

        {/* Technician */}
        <Route path="/technician" element={<TechnicianDashboard />} />

        <Route path="/technician/profile" element={<TechnicianProfile />} />

        <Route path="/technician/portfolio" element={<TechnicianPortfolio />} />

        {/* Agency Registration */}
        <Route path="/agency-register" element={<AgencyRegister />} />

        {/* Agency Profile Setup */}
        <Route path="/agency/profile-setup" element={<AgencyProfileSetup />} />

        {/* Existing Agency Profile */}
        <Route path="/agency/profile" element={<AgencyProfile />} />

        {/* Agency Dashboard */}
        <Route path="/agency" element={<AgencyDashboard />} />

        <Route path="/agency/technicians" element={<AgencyTechnicians />} />

        <Route
          path="/agency/service-requests"
          element={<AgencyServiceRequests />}
        />

        <Route
          path="/agency/technicians/:id"
          element={<AgencyTechnicianDetails />}
        />

        <Route path="/agency/subscription" element={<AgencySubscription />} />

        <Route path="/agency/reports" element={<AgencyReports />} />

        <Route path="/agency/settings" element={<AgencySettings />} />

        {/* Client Dashboard */}
        <Route path="/client" element={<ClientDashboard />} />

        <Route path="/client/settings" element={<ClientSettings />} />

        <Route path="/technician/availability" element={<Availability />} />

        <Route
          path="/technician/verification"
          element={<TechnicianVerification />}
        />

        <Route
          path="/technician/subscription"
          element={<TechnicianSubscription />}
        />

        <Route path="/technician/settings" element={<TechnicianSettings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
