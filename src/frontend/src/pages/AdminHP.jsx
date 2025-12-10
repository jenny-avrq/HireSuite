import React, { useState, useEffect } from 'react';
import { Briefcase, Heart, Clock, Award, Users, DollarSign, Plus, Edit, Trash2, MapPin, Calendar, CheckCircle, AlertTriangle, ChevronDown, Eye, Camera } from "lucide-react";
import '../styles/admHomepage.css';

function AdminHP() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [showJobModal, setShowJobModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteJobId, setDeleteJobId] = useState(null);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  
  // Applicants state
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState('ongoing');
  const [activeSubFilter, setActiveSubFilter] = useState('all');
  const [expandedCard, setExpandedCard] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoModalName, setPhotoModalName] = useState('');
  
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobType: '',
    jobLocation: '',
    jobExperience: '',
    jobDescription: ''
  });

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen]);

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

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // Redirect to Homepage
    window.location.href = "/";
    setShowLogoutModal(false);
  };

  const showAlertMessage = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const openJobModal = (job = null) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        jobTitle: job.title,
        jobType: job.type,
        jobLocation: job.location,
        jobExperience: job.experience,
        jobDescription: job.description
      });
      setSkills([...job.skills]);
    } else {
      setEditingJob(null);
      setFormData({
        jobTitle: '',
        jobType: '',
        jobLocation: '',
        jobExperience: '',
        jobDescription: ''
      });
      setSkills([]);
    }
    setShowJobModal(true);
  };

  const closeJobModal = () => {
    setShowJobModal(false);
    setEditingJob(null);
    setFormData({
      jobTitle: '',
      jobType: '',
      jobLocation: '',
      jobExperience: '',
      jobDescription: ''
    });
    setSkills([]);
    setSkillInput('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (trimmedSkill && !skills.includes(trimmedSkill)) {
      setSkills([...skills, trimmedSkill]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (skills.length === 0) {
      showAlertMessage('Please add at least one required skill.', 'danger');
      return;
    }

    const jobData = {
      id: editingJob ? editingJob.id : 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      title: formData.jobTitle,
      type: formData.jobType,
      location: formData.jobLocation,
      experience: formData.jobExperience,
      description: formData.jobDescription,
      skills: [...skills],
      datePosted: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      timestamp: Date.now()
    };

    if (editingJob) {
      setJobs(jobs.map(job => job.id === editingJob.id ? jobData : job));
      showAlertMessage('Job successfully updated!', 'success');
    } else {
      setJobs([...jobs, jobData]);
      showAlertMessage('Job successfully created!', 'success');
    }

    closeJobModal();
  };

  const openDeleteModal = (jobId) => {
    setDeleteJobId(jobId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setJobs(jobs.filter(job => job.id !== deleteJobId));
    setShowDeleteModal(false);
    setDeleteJobId(null);
    showAlertMessage('Job successfully deleted!', 'success');
  };

  // Applicant functions
  useEffect(() => {
    filterApplicants();
  }, [activeStatusFilter, activeSubFilter, applicants]);

  const filterApplicants = () => {
    let filtered = [...applicants];

    if (activeStatusFilter === 'ongoing') {
      filtered = filtered.filter(app => app.status !== 'hired' && app.status !== 'rejected');
      
      if (activeSubFilter !== 'all') {
        filtered = filtered.filter(app => app.status === activeSubFilter);
      }
    } else if (activeStatusFilter === 'archived') {
      if (activeSubFilter === 'all') {
        filtered = filtered.filter(app => app.status === 'hired' || app.status === 'rejected');
      } else {
        filtered = filtered.filter(app => app.status === activeSubFilter);
      }
    }

    setFilteredApplicants(filtered);
  };

  const toggleCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const openPhotoModal = (photoUrl, name) => {
    setSelectedPhoto(photoUrl);
    setPhotoModalName(name);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
    setPhotoModalName('');
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'under-review': 'status-under-review',
      'for-interview': 'status-for-interview',
      'final-review': 'status-final-review',
      'hired': 'status-hired',
      'rejected': 'status-archived'
    };
    return statusClasses[status] || 'status-under-review';
  };

  const getStatusText = (status) => {
    const statusTexts = {
      'under-review': 'Under Review',
      'for-interview': 'For Interview',
      'final-review': 'Final Review',
      'hired': 'Hired',
      'rejected': 'Rejected'
    };
    return statusTexts[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert */}
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>
          <CheckCircle size={20} />
          <span id="alertMessage">{alert.message}</span>
        </div>
      )}

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
            <a href="#post-job" className="nav-link">
              Post Job Vacancy
            </a>
            <a href="#view-applicants" className="nav-link">
              View Applicants
            </a>
            <a href="#" className="nav-logout" onClick={handleLogout}>
              Logout
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
            <a href="#post-job" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              Post Job Vacancy
            </a>
            <a href="#view-applicants" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              View Applicants
            </a>
            <a href="#" className="mobile-logout" onClick={() => { setMobileMenuOpen(false); handleLogout(); }}>
              Logout
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
            <a href="#post-job" className="btn-hero">
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

      {/* Post Job Vacancy Section */}
      <section id="post-job" className="post-job-section">
        <div className="container">
          <div className="page-title">
            <h2 className="section-heading">
              Jobs Management
              <span className="heading-underline"></span>
            </h2>
            <div className="page-title-actions">
              <span className="sync-status">
                <svg className="sync-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                </svg>
                Ready
              </span>
              <button onClick={() => openJobModal()} className="btn btn-post-job">
                <Plus size={20} /> Post New Job
              </button>
            </div>
          </div>

          <div className="job-list">
            {jobs.length === 0 ? (
              <div className="empty-state">
                <Briefcase size={48} className="empty-icon" />
                <h3 className="empty-title">No jobs posted yet</h3>
                <p className="empty-text">Click "Post New Job" to create your first job vacancy.</p>
                <button onClick={() => openJobModal()} className="btn btn-success">
                  <Plus size={20} /> Post Your First Job
                </button>
              </div>
            ) : (
              jobs.map(job => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <div>
                      <h3 className="job-title">{job.title}</h3>
                      <span className="job-type">{job.type}</span>
                    </div>
                  </div>
                  
                  <div className="job-info">
                    <div className="job-location">
                      <MapPin size={18} />
                      <span>{job.location}</span>
                    </div>
                    <div className="job-experience">
                      <Briefcase size={18} />
                      <span>{job.experience}</span>
                    </div>
                    <div className="job-date">
                      <Calendar size={18} />
                      <span>Posted: {job.datePosted}</span>
                    </div>
                  </div>

                  <div className="job-skills">
                    <div className="skills-title">Required Skills:</div>
                    <div className="skills-list">
                      {job.skills.map((skill, idx) => (
                        <span key={idx} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="job-description">
                    <div className="description-title">Job Description:</div>
                    <p>{job.description}</p>
                  </div>

                  <div className="job-actions">
                    <button onClick={() => openJobModal(job)} className="btn btn-sm btn-info">
                      <Edit size={16} /> Edit
                    </button>
                    <button onClick={() => openDeleteModal(job.id)} className="btn btn-sm btn-danger">
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* View Applicants Section */}
      <section id="view-applicants" className="view-applicants-section">
        <div className="container">
          <div className="page-header">
            <h2 className="section-heading">
              Applicant Management
              <span className="heading-underline"></span>
            </h2>
            <p className="page-subtitle">Review and manage job applications efficiently</p>
          </div>

          {/* Filter Section */}
          <div className="filter-section">
            <div className="filter-header">
              <h3 className="filter-title">Filter Applicants</h3>
            </div>
            <div className="filter-controls">
              <div className="filter-group">
                <label className="filter-label">Application Status</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button 
                    className={`filter-btn ${activeStatusFilter === 'ongoing' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveStatusFilter('ongoing');
                      setActiveSubFilter('all');
                    }}
                  >
                    Ongoing Applications
                  </button>
                  <button 
                    className={`filter-btn ${activeStatusFilter === 'archived' ? 'active' : ''}`}
                    onClick={() => {
                      setActiveStatusFilter('archived');
                      setActiveSubFilter('all');
                    }}
                  >
                    Archived Applications
                  </button>
                </div>
              </div>

              {activeStatusFilter === 'ongoing' && (
                <div className="filter-group">
                  <label className="filter-label">Review Stage</label>
                  <select 
                    className="status-filter"
                    value={activeSubFilter}
                    onChange={(e) => setActiveSubFilter(e.target.value)}
                  >
                    <option value="all">All Stages</option>
                    <option value="under-review">Under Review</option>
                    <option value="for-interview">For Interview</option>
                    <option value="final-review">Final Review</option>
                  </select>
                </div>
              )}

              {activeStatusFilter === 'archived' && (
                <div className="filter-group">
                  <label className="filter-label">Archived Status</label>
                  <select 
                    className="status-filter"
                    value={activeSubFilter}
                    onChange={(e) => setActiveSubFilter(e.target.value)}
                  >
                    <option value="all">All Archived</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Applicants Container */}
          <div className="applicants-container">
            <div className="applicants-header">
              <h3 className="applicants-count">Showing {filteredApplicants.length} applicants</h3>
            </div>

            {filteredApplicants.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <h3 className="empty-title">No applicants found</h3>
                <p className="empty-description">No applications match your current filters or no applications have been submitted yet.</p>
              </div>
            ) : (
              <div className="applicant-cards">
                {filteredApplicants.map(applicant => (
                  <div 
                    key={applicant.id} 
                    className={`applicant-card ${expandedCard === applicant.id ? 'expanded' : ''}`}
                  >
                    <div className="card-main">
                      <div 
                        className="applicant-photo"
                        onClick={() => applicant.photo && openPhotoModal(applicant.photo, applicant.name)}
                      >
                        {applicant.photo ? (
                          <img src={applicant.photo} alt={applicant.name} />
                        ) : (
                          <Camera size={32} />
                        )}
                      </div>

                      <div className="applicant-info">
                        <h3 className="applicant-name">{applicant.name}</h3>
                        <div className="applicant-details">
                          <div className="detail-item">
                            <span className="detail-label">Position:</span>
                            <span>{applicant.position}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span className={`status-badge ${getStatusBadgeClass(applicant.status)}`}>
                              {getStatusText(applicant.status)}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Applied:</span>
                            <span>{applicant.appliedDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="card-actions-section">
                        {applicant.resumeUrl && (
                          <a 
                            href={applicant.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="view-resume-btn"
                          >
                            <Eye size={16} /> View Resume
                          </a>
                        )}
                        <button 
                          onClick={() => toggleCard(applicant.id)}
                          className="expand-icon"
                        >
                          <ChevronDown size={24} />
                        </button>
                      </div>
                    </div>

                    {expandedCard === applicant.id && (
                      <div className="card-actions visible">
                        <div className="applicant-details">
                          <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span>{applicant.email}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Phone:</span>
                            <span>{applicant.phone}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Experience:</span>
                            <span>{applicant.experience}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="modal-overlay active" onClick={closePhotoModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <div className="modal-icon">
                  <Camera size={24} />
                </div>
                <span>{photoModalName}</span>
              </div>
              <button className="close-btn" onClick={closePhotoModal}>×</button>
            </div>
            <div className="modal-content">
              {selectedPhoto ? (
                <img src={selectedPhoto} alt={photoModalName} className="photo-large" />
              ) : (
                <div className="photo-placeholder">
                  <Camera size={96} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Job Modal */}
      {showJobModal && (
        <div className="modal" onClick={(e) => e.target.className === 'modal' && closeJobModal()}>
          <div className="modal-content">
            <button onClick={closeJobModal} className="close-modal">
              ×
            </button>
            
            <h2 className="modal-title">
              {editingJob ? 'Edit Job' : 'Post New Job'}
            </h2>
            
            <div>
              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label">Job Title</label>
                    <input 
                      type="text" 
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      className="form-control"
                      required 
                    />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label">Job Type</label>
                    <select 
                      name="jobType"
                      value={formData.jobType}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    >
                      <option value="">Select Job Type</option>
                      <option value="Full-Time">Full-Time</option>
                      <option value="Part-Time">Part-Time</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input 
                      type="text" 
                      name="jobLocation"
                      value={formData.jobLocation}
                      onChange={handleInputChange}
                      placeholder="e.g., SM City Fairview Branch - On-site"
                      className="form-control"
                      required 
                    />
                  </div>
                </div>
                <div className="form-col">
                  <div className="form-group">
                    <label className="form-label">Experience Required</label>
                    <select 
                      name="jobExperience"
                      value={formData.jobExperience}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    >
                      <option value="">Select Experience Level</option>
                      <option value="0-2 years of experience">0-2 years</option>
                      <option value="2-5 years of experience">2-5 years</option>
                      <option value="5-8 years of experience">5-8 years</option>
                      <option value="8+ years of experience">8+ years</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Job Description</label>
                <textarea 
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  rows="5"
                  placeholder="Describe the job responsibilities, requirements, and what you're looking for in a candidate..."
                  className="form-control"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Required Skills</label>
                <input 
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleSkillKeyPress}
                  placeholder="Type a skill and press Enter to add"
                  className="form-control"
                />
                <div className="tags-container">
                  {skills.map((skill, idx) => (
                    <div key={idx} className="tag">
                      {skill}
                      <span 
                        onClick={() => removeSkill(skill)}
                        className="tag-remove"
                      >
                        ×
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  onClick={closeJobModal}
                  className="btn btn-sm"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={handleSubmit}
                  className="btn btn-sm btn-success"
                >
                  Save Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="confirm-modal" onClick={(e) => e.target.className === 'confirm-modal' && setShowDeleteModal(false)}>
          <div className="confirm-content">
            <div className="confirm-icon">
              <AlertTriangle size={48} />
            </div>
            <div className="confirm-text">Are you sure you want to delete this job?</div>
            <div className="confirm-actions">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="btn btn-sm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="btn btn-sm btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="confirm-modal" onClick={(e) => e.target.className === 'confirm-modal' && setShowLogoutModal(false)}>
          <div className="confirm-content">
            <div className="confirm-icon logout-icon-modal">
              <span>⤴</span>
            </div>
            <div className="confirm-text">Are you sure you want to logout?</div>
            <div className="confirm-actions">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="btn btn-sm"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="btn btn-sm btn-post-job"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

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
}

export default AdminHP;