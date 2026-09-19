import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import {
  Search,
  ShieldCheck,
  Clock3,
  Star,
  ArrowRight,
} from "lucide-react";

import logo from "./assets/proquire-logo.png";
import Login from "./pages/Login";
import TechnicianDashboard from "./pages/TechnicianDashboard";

import "./App.css";

function Home() {
  return (
    <div className="app">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="logo-link">
            <img src={logo} alt="ProQuire Logo" className="logo" />
          </Link>

          <div className="nav-links">
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#about">About</a>
            <Link to="/login">Log In</Link>
            <Link to="/login" className="nav-button">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="trusted-badge">
            <ShieldCheck size={18} />
            Trusted Skilled Professionals
          </div>

          <h1>
            Find the Right
            <span> Technician </span>
            for the Job
          </h1>

          <p>
            Connect with verified skilled technicians and service agencies
            for reliable, professional services.
          </p>

          <div className="search-box">
            <div className="search-input">
              <Search size={20} />
              <span>What service do you need?</span>
            </div>

            <div className="search-input location">
              <span>📍</span>
              <span>Your location</span>
            </div>

            <button className="search-button">
              Search
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services-section" id="services">
        <div className="section-heading">
          <span>OUR SERVICES</span>
          <h2>Professional Services You Can Trust</h2>
          <p>
            Find skilled professionals across a wide range of service
            categories.
          </p>
        </div>

        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">🔧</div>
            <h3>Plumbing</h3>
            <p>
              Find qualified plumbers for installation, repair and maintenance.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon">⚡</div>
            <h3>Electrical</h3>
            <p>
              Connect with professional electricians for safe electrical work.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon">🏗️</div>
            <h3>Construction</h3>
            <p>
              Get skilled construction professionals for your projects.
            </p>
          </div>

          <div className="service-card">
            <div className="service-icon">🛠️</div>
            <h3>Mechanical</h3>
            <p>
              Find experienced mechanics for vehicle and equipment repairs.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how-it-works">
        <div className="section-heading">
          <span>HOW IT WORKS</span>
          <h2>Get Your Problem Solved in 4 Simple Steps</h2>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Search</h3>
            <p>
              Search for the service you need and choose your location.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Compare</h3>
            <p>
              Compare verified technicians based on experience, ratings and
              reviews.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3>Request</h3>
            <p>
              Send a service request to the professional that fits your needs.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>
            <h3>Get It Done</h3>
            <p>
              Work with your chosen professional and get your job completed.
            </p>
          </div>
        </div>
      </section>

      {/* PROFESSIONAL CTA */}
      <section className="professional-section">
        <div className="professional-content">
          <div>
            <span>ARE YOU A PROFESSIONAL?</span>
            <h2>Grow Your Business with ProQuire</h2>
            <p>
              Join our platform and connect with clients looking for your
              skills and expertise.
            </p>
          </div>

          <Link to="/login" className="professional-button">
            Join ProQuire
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ABOUT */}
      <section className="about-section" id="about">
        <div className="section-heading">
          <span>ABOUT PROQUIRE</span>
          <h2>Connecting People With Trusted Professionals</h2>
          <p>
            ProQuire makes it easier for clients to find skilled and verified
            technicians while helping professionals reach more customers.
          </p>
        </div>

        <div className="about-features">
          <div>
            <ShieldCheck size={28} />
            <h3>Verified Professionals</h3>
            <p>
              Technician credentials can be reviewed through the platform's
              verification process.
            </p>
          </div>

          <div>
            <Clock3 size={28} />
            <h3>Save Time</h3>
            <p>
              Find and compare professionals without having to search
              manually.
            </p>
          </div>

          <div>
            <Star size={28} />
            <h3>Reviews & Ratings</h3>
            <p>
              Use reviews and ratings to understand previous client
              experiences.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <img src={logo} alt="ProQuire Logo" className="footer-logo" />
            <p>
              Connecting clients with skilled technicians and service
              professionals.
            </p>
          </div>

          <div>
            <h3>Quick Links</h3>
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#about">About</a>
          </div>

          <div>
            <h3>For Professionals</h3>
            <Link to="/login">Join ProQuire</Link>
            <Link to="/login">Professional Login</Link>
          </div>

          <div>
            <h3>Follow Us</h3>

            <div className="social-links">
              <a href="#" aria-label="Facebook">
                Facebook
              </a>

              <a href="#" aria-label="Twitter">
                Twitter
              </a>

              <a href="#" aria-label="Instagram">
                Instagram
              </a>

              <a href="#" aria-label="LinkedIn">
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 ProQuire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/technician" element={<TechnicianDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;