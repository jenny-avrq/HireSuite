import React, { useState, useEffect } from "react";
import { Briefcase, Heart, Clock, Award, Users, DollarSign } from "lucide-react";
import "../styles/homepage.css";

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

  // LOAD JOBS — replaces your script/apply.js
  useEffect(() => {
    if (window.loadJobsFromAdmin) {
      window.loadJobsFromAdmin();
    }
  }, []);

  // Smooth scrolling for anchor links
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (!target) return;

      e.preventDefault();
      const href = target.getAttribute('href');
      
      if (href === '#') {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => document.removeEventListener('click', handleAnchorClick);
  }, []);

  const handleRefreshJobs = () => {
    if (window.loadJobsFromAdmin) {
      window.loadJobsFromAdmin();
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="flex items-center">
            <a href="#" className="logo">
              HireSuite
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="nav-desktop">
            <a href="#about" className="nav-link">
              About Us
            </a>
            <a href="#opportunities" className="nav-link">
              Opportunities
            </a>
            <a href="#apply" className="nav-link">
              Apply
            </a>
            <a href="#login" className="nav-login">
              Login/Signup
            </a>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className="mobile-overlay"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="mobile-nav">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-close"
            >
              ×
            </button>
            <a href="#about" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              About Us
            </a>
            <a href="#opportunities" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              Opportunities
            </a>
            <a href="#apply" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              Apply
            </a>
            <a href="#login" className="mobile-login" onClick={() => setMobileMenuOpen(false)}>
              Login/Signup
            </a>
          </nav>
        </>
      )}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Join the <span className="hero-highlight">HireSuite</span> Team
          </h1>
          <p className="hero-text">
            Discover opportunities to grow your career with one of the most innovative recruitment platforms connecting talent with opportunity
          </p>
          <div className="hero-buttons">
            <a href="#opportunities" className="btn-hero">
              Explore Benefits
            </a>
            <a href="#apply" className="btn-hero">
              View Openings
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-content">
              <h2 className="section-heading">
                About HireSuite
                <span className="heading-underline"></span>
              </h2>
              <p className="about-text">
                HireSuite is a leading recruitment and talent management platform dedicated to connecting exceptional professionals with outstanding career opportunities. We streamline the hiring process for both employers and job seekers through innovative technology and personalized service.
              </p>
              <p className="about-features-title">
                Key Features:
              </p>
              <ul className="about-features">
                <li>
                  <strong>Smart Matching:</strong> Our AI-powered platform matches candidates with roles that fit their skills and career goals.
                </li>
                <li>
                  <strong>Industry Expertise:</strong> We specialize in placements across technology, healthcare, finance, and creative industries.
                </li>
                <li>
                  <strong>Career Development:</strong> Comprehensive support including resume building, interview prep, and career coaching.
                </li>
                <li>
                  <strong>Global Network:</strong> Access to opportunities with top companies worldwide.
                </li>
                <li>
                  <strong>Transparent Process:</strong> Clear communication and regular updates throughout your job search journey.
                </li>
                <li>
                  <strong>Success Stories:</strong> Thousands of successful placements and satisfied professionals.
                </li>
              </ul>
            </div>
            <div className="about-image-wrapper">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
                alt="HireSuite Professional Team"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Opportunities Section */}
      <section id="opportunities" className="opportunities-section">
        <div className="container">
          <div className="opportunities-header">
            <h2 className="section-heading centered">
              Why Join Us?
              <span className="heading-underline centered"></span>
            </h2>
            <p className="opportunities-text">
              At HireSuite, we believe that our team members are the foundation of our success and we invest in their growth and wellbeing.
            </p>
          </div>
          
          <div className="benefits-grid">
            <div className="benefit-card">
              <Briefcase className="benefit-icon" size={40} />
              <h3 className="benefit-title">Career Growth</h3>
              <p className="benefit-text">
                Comprehensive training programs and advancement pathways to help you grow professionally.
              </p>
            </div>

            <div className="benefit-card">
              <Heart className="benefit-icon" size={40} />
              <h3 className="benefit-title">Health Benefits</h3>
              <p className="benefit-text">
                Competitive health, dental, and vision insurance packages for you and your family.
              </p>
            </div>

            <div className="benefit-card">
              <Clock className="benefit-icon" size={40} />
              <h3 className="benefit-title">Work-Life Balance</h3>
              <p className="benefit-text">
                Flexible scheduling, remote work options, and generous paid time off policies.
              </p>
            </div>

            <div className="benefit-card">
              <Award className="benefit-icon" size={40} />
              <h3 className="benefit-title">Professional Development</h3>
              <p className="benefit-text">
                Access to industry certifications, workshops, and continuous learning opportunities.
              </p>
            </div>

            <div className="benefit-card">
              <Users className="benefit-icon" size={40} />
              <h3 className="benefit-title">Inclusive Culture</h3>
              <p className="benefit-text">
                A supportive and diverse work environment where everyone's voice is heard and valued.
              </p>
            </div>

            <div className="benefit-card">
              <DollarSign className="benefit-icon" size={40} />
              <h3 className="benefit-title">Competitive Pay</h3>
              <p className="benefit-text">
                Industry-leading salary packages with performance bonuses and equity options.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Apply Section */}
      <section id="apply" className="apply-section">
        <div className="container">
          <div className="apply-header">
            <h2 className="section-heading centered">
              Open Positions at HireSuite
              <span className="heading-underline centered"></span>
            </h2>
            <p className="apply-subtitle">
              Join our team and help shape the future of recruitment technology. Browse current openings and find your perfect role.
            </p>
          </div>

          <div className="filter-section">
            <div className="filter-header">
              <h3 className="filter-title">Find Your Role</h3>
              <button 
                className="refresh-btn"
                onClick={handleRefreshJobs}
              >
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
            </div>

            <div className="filter-options">
              <select className="filter-select" id="jobTypeFilter">
                <option value="all">All Job Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>

              <select className="filter-select" id="locationFilter">
                <option value="all">All Locations</option>
                <option value="office">Office</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>

              <select className="filter-select" id="experienceFilter">
                <option value="all">All Experience Levels</option>
                <option value="0-2">0-2 Years</option>
                <option value="2-5">2-5 Years</option>
                <option value="5-8">5-8 Years</option>
                <option value="8+">8+ Years</option>
              </select>
            </div>
          </div>

          <div className="job-count" id="jobCount">
            Loading jobs...
          </div>

          <div className="job-list" id="jobList">
            {/* Jobs will appear here */}
          </div>

          <div id="locked-section" className="locked-content" style={{ display: "none" }}>
            <div className="lock-icon">
              🔒
            </div>

            <h3>Unlock More Opportunities</h3>
            <p>
              Create your HireSuite account to access our complete job board, save your favorite positions, and get personalized recommendations based on your profile.
            </p>

            <a href="#login" className="locked-btn">
              Sign Up or Login
            </a>
          </div>
        </div>
      </section>

      {/* Login/Signup Section */}
      <section id="login" className="login-section">
        <div className="login-container">
          <div className="auth-container">
            <div className="auth-image">
              <h2>Join the HireSuite Team</h2>
              <p>Create an account to apply for positions and track your application</p>
            </div>

            <div className="auth-forms">
              <div className="tab-buttons">
                <button 
                  className={`tab-button login-btn ${activeTab === "login" ? "active" : ""}`}
                  onClick={() => switchTab("login")}
                >
                  Login
                </button>
                <button 
                  className={`tab-button signup-btn ${activeTab === "signup" ? "active" : ""}`}
                  onClick={() => switchTab("signup")}
                >
                  Sign Up
                </button>
              </div>

              {/* LOGIN Form */}
              <div id="login" className={`form-content ${activeTab === "login" ? "active" : ""}`}>
                <form action="http://localhost:3000/login" method="post">
                  <div className="form-group">
                    <label>Email / Phone Number</label>
                    <input 
                      type="text" 
                      name="loginEmail" 
                      placeholder="Enter your email or phone number" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password" 
                      name="loginPassword" 
                      placeholder="Enter your password" 
                      required 
                    />
                  </div>

                  <a href="#" className="forgot-password">Forgot Password?</a>

                  <div className="form-footer">
                    <button type="submit" className="btn">Log In</button>
                    <p>
                      Don't have an account? 
                      <span onClick={() => switchTab("signup")} style={{cursor: "pointer"}}>Sign Up</span>
                    </p>
                  </div>
                </form>
              </div>

              {/* SIGN UP Form */}
              <div id="signup" className={`form-content ${activeTab === "signup" ? "active" : ""}`}>
                <form action="http://localhost:3000/register" method="post">
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      name="signupEmail" 
                      placeholder="Enter your email address" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      name="signupPhone" 
                      placeholder="Enter your phone number" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input 
                      type="password" 
                      name="signupPassword" 
                      placeholder="Create a password" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input 
                      type="password" 
                      name="signupConfirmPassword" 
                      placeholder="Confirm your password" 
                      required 
                    />
                  </div>

                  <div className="form-footer">
                    <button type="submit" className="btn">Create Account</button>
                    <p>
                      Already have an account? 
                      <span onClick={() => switchTab("login")} style={{cursor: "pointer"}}>Log In</span>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">
            HireSuite
          </div>
          <p className="copyright">
            © 2025 HireSuite. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;