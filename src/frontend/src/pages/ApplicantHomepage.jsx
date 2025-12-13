import React, { useState, useEffect } from "react";
import { Briefcase, Heart, Clock, Award, Users, DollarSign, Bell, User, X, Check, Calendar, Trophy, Phone, FileText, CheckCircle, AlertCircle, RefreshCw, Upload, Eye, Trash2, AlertTriangle, MapPin, Search } from "lucide-react";
import "../styles/applicantHomepage.css";

const ApplicantHomepage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [applications, setApplications] = useState([]);
  const [statusBadgeCount, setStatusBadgeCount] = useState(0);
  const [hasHiredStatus, setHasHiredStatus] = useState(false);

  // Profile form states
  const [profileData, setProfileData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    age: '',
    address: ''
  });
  
  // Profile states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentResume, setCurrentResume] = useState(null); // For new resume
  const [resumeFile, setResumeFile] = useState(null); // For existing resume
  const [resumeId, setResumeId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  // Job listings states
  const [allJobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [experienceFilter, setExperienceFilter] = useState('all');
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Apply states
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs]  = useState([]);

  useEffect(() => {
  window.location.hash = "";  // clears #profile, #login, etc.
  window.scrollTo(0, 0);      // scrolls to hero section
}, []);

  // Add smooth scrolling CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      html {
        scroll-behavior: smooth;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    loadProfile();
  }, []);
  

  useEffect(() => {
    loadApplications();
    loadJobs();
  }, []);

  useEffect(() => {
    const hiredApps = applications.filter(app => app.status === 'hired');
    setHasHiredStatus(hiredApps.length > 0);
    setStatusBadgeCount(hiredApps.length || applications.filter(app => 
      ['for-interview', 'interview-scheduled', 'resume-accepted', 'final-review'].includes(app.status)
    ).length);
  }, [applications]);

  useEffect(() => {
    if (mobileMenuOpen || logoutModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [mobileMenuOpen, logoutModalOpen]);

// === START PROFILE === //

  useEffect(() => {
    if (profileData.dateOfBirth) {
      const dob = new Date(profileData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      setProfileData(prev => ({ ...prev, age: age.toString() }));
    }
  }, [profileData.dateOfBirth]);

  const loadProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/profile/fetch', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData({
          firstName: data.first_name || '',
          middleName: data.middle_name || '',
          lastName: data.last_name || '',
          email: data.email || '',
          phoneNumber: data.phone_number || '',
          dateOfBirth: data.date_of_birth ? new Date(data.date_of_birth).toISOString().split('T')[0] : '',
          gender: data.gender || '',
          age: data.age || '',
          address: data.residential_address || ''
        });

        if (data.resume) {
          setCurrentResume({
            fileName: data.resume.fileName,
            fileType: data.resume.fileType,
            fileSize: data.resume.fileSize
          });
          setResumeId(data.resume.resumeId || null);
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF file.');
      e.target.value = '';
      return;
    }

    // Validate file size (maximum of 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      e.target.value = '';
      return;
    }

    // Save File object for FormData upload
    setResumeFile(file);
    setCurrentResume({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });
  };

  const handleDragOver = (e) => {
    if (!isEditingProfile) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    if (!isEditingProfile) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF, DOC, or DOCX file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setResumeFile(file);
    setCurrentResume({
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });
  };

  const viewResume = () => {
    if (resumeId) {
      window.open(`http://localhost:5000/profile/resume/${resumeId}`, '_blank');
    } else if (resumeFile) {
      const fileURL = URL.createObjectURL(resumeFile);
      window.open(fileURL, '_blank');
      setTimeout(() => URL.revokeObjectURL(fileURL), 60000);
    } else {
      alert('No resume available to view.');
    }
  };

  const removeResume = async () => {
    if (!window.confirm('Are you sure you want to remove your resume? A resume is required for job applications.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/profile/remove-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      const data = await response.json();

      // Only cllear state if the resume is successfully removed
      if (response.ok) {
        setCurrentResume(null);
        setResumeFile(null);
        setResumeId(null);

        alert('Resume removed successfully.');
      }
    } catch (err) {
      console.error('Failed to remove resume:', err);
      alert('Could not remove resume. Please try again.');
    }
  };

  const saveProfile = async () => {
    if (saving) return;
    setSaving(true);

    try {
      const requiredFields = ['firstName', 'lastName', 'email', 'phoneNumber', 'dateOfBirth', 'gender', 'address'];
      const missingFields = requiredFields.filter(field => !profileData[field] || profileData[field].trim() === '');
      
      if (missingFields.length > 0) {
        alert('Please fill in all required fields.');
        return;
      }

      const formData = new FormData();
      Object.keys(profileData).forEach(key => formData.append(key, profileData[key] ?? ''));

      if (resumeFile) {
        formData.append('resumeFile', resumeFile); // File upload
      }

      const response = await fetch('http://localhost:5000/profile/update', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Server error:', text);
        alert('Failed to save profile: ' + text);
        return;
      }

      const result =  await response.json();

      if (result.success) {
        alert('Profile saved successfully!');
        setIsEditingProfile(false);
        setResumeFile(null);
        await loadProfile();
      } else {
        alert(result.error || 'Failed to save profile');
      }

    } catch (err) {
      console.error('Save failed:', err);
      alert('Could not save profile. Please try again.');
    
    } finally {
      setSaving(false);
    }
  };

// === END PROFILE === //

// === START JOB LISTING === //

  // Filter jobs whenever filter values change
  useEffect(() => {
    filterJobs();
  }, [jobTypeFilter, locationFilter, experienceFilter, allJobs]);

  const loadJobs = async () => {
    try {
      const res = await fetch("http://localhost:5000/job/get-jobs", {
        credentials: "include"
      });

      const data = await res.json();

      if (res.ok) {
        const formattedJobs = data.map(job => ({
          id: job.job_id,
          title: job.job_title,
          type: job.job_type,
          location: job.location,
          experience: job.experience,
          description: job.description,
          skills: job.skills,
          datePosted: new Date(job.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
        }));

        setJobs(formattedJobs);
        setFilteredJobs(formattedJobs);

      } else {
        console.error(data.error);
      }
      
    } catch (error) {
      console.error("Fetch jobs error:", error);

    } finally {
      setIsLoadingJobs(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...allJobs];

    if (jobTypeFilter !== 'all') {
      filtered = filtered.filter(job => job.type === jobTypeFilter);
    }

    if (locationFilter !== 'all') {
      filtered = filtered.filter(job => {
        const locationLower = job.location.toLowerCase();
        if (locationFilter === 'office') return locationLower.includes('on-site') || locationLower.includes('office');
        if (locationFilter === 'remote') return locationLower.includes('remote') || locationLower.includes('work from home');
        if (locationFilter === 'hybrid') return locationLower.includes('hybrid');
        return true;
      });
    }

    if (experienceFilter !== 'all') {
      filtered = filtered.filter(job => {
        const expLower = job.experience.toLowerCase();
        return expLower.includes(experienceFilter);
      });
    }

    setFilteredJobs(filtered);
  };

// === END JOB LISTING === //

// === START APPLY === //

const confirmApplication = async () => {
  if (!selectedJob || !resumeId) {
    alert('Please upload a resume before applying.');
    return;
  };

  try {
    const jobId = selectedJob.id;

    const response = await fetch("http://localhost:5000/apply/submit-application", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resumeId,
        jobId,
      }),
      credentials: 'include',
    });

    const data = await response.json();

    if (response.ok) {
      // Close modal
      setApplyModalOpen(false);
      // Mark job as applied
      setAppliedJobs(prev => [...prev, jobId]);
      setSelectedJob(null);

      alert(data.message);

    } else {
      alert(data.error || 'Failed to submit application.');
    }

  } catch (err) {
    console.error('Error submitting application:', err);
    alert('Something went wrong. Please try again.');
  }
};

// === END APPLY === //

// === START LOGOUT === //

  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
    sessionStorage.clear();
    window.location.href = "/";
  };

// === END LOGOUT === //

// === START APPLICATIONS === //

  const loadApplications = async () => {
    try {
      const response = await fetch('http://localhost:5000/apply/my-applications', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setApplications(result.applications || []);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  };

  const getStatusDisplayText = (status) => {
    const statusMap = {
      'under-review': 'Under Review',
      'resume-accepted': 'Resume Accepted',
      'resume-rejected': 'Resume Rejected',
      'for-interview': 'For Interview',
      'interview-scheduled': 'Interview Scheduled',
      'interview-rejected': 'Interview Rejected',
      'final-review': 'Final Review',
      'hired': 'HIRED!',
      'rejected': 'Application Rejected',
      'archived': 'Application Closed'
    };
    return statusMap[status] || 'Under Review';
  };

  const getStatusBadgeClass = (status) => {
    const classMap = {
      'under-review': 'under-review',
      'resume-accepted': 'resume-accepted',
      'resume-rejected': 'resume-rejected',
      'for-interview': 'interview-scheduled',
      'interview-scheduled': 'interview-scheduled',
      'interview-rejected': 'interview-rejected',
      'final-review': 'interview-scheduled',
      'hired': 'hired',
      'rejected': 'rejected',
      'archived': 'rejected'
    };
    return classMap[status] || 'under-review';
  };

// === END APPLICATIONS === //

  const StatusCard = ({ application }) => (
    <div className={`status-card ${application.status === 'hired' ? 'hired-permanent' : ''}`}>
      <div className="status-header">
        <div>
          <div className="status-job-title">{application.jobTitle}</div>
          <div className="status-application-id">Application ID: {application.application_id}</div>
        </div>
        <div className={`status-badge-large ${getStatusBadgeClass(application.status)}`}>
          {getStatusDisplayText(application.status)}
        </div>
      </div>

      <div className="status-timeline">
        <div className="timeline-item">
          <div className="timeline-icon completed">
            <Check size={12} />
          </div>
          <span>Application Submitted - {new Date(application.createdAt).toLocaleDateString()}</span>
        </div>
        {application.status !== 'resume-rejected' && (
          <div className="timeline-item">
            <div className={`timeline-icon ${['resume-accepted', 'for-interview', 'interview-scheduled', 'final-review', 'hired'].includes(application.status) ? 'completed' : 'current'}`}>
              <FileText size={12} />
            </div>
            <span>Resume Under Review</span>
          </div>
        )}
        {['for-interview', 'interview-scheduled', 'final-review', 'hired'].includes(application.status) && (
          <div className="timeline-item">
            <div className={`timeline-icon ${['final-review', 'hired'].includes(application.status) ? 'completed' : 'current'}`}>
              <Users size={12} />
            </div>
            <span>Interview Process</span>
          </div>
        )}
        {['hired', 'rejected'].includes(application.status) && (
          <div className="timeline-item">
            <div className={`timeline-icon ${application.status === 'hired' ? 'completed' : 'pending'}`}>
              <Trophy size={12} />
            </div>
            <span>Final Decision</span>
          </div>
        )}
      </div>

      {application.status === 'hired' && (
        <div className="hired-celebration">
          <h4><Trophy size={32} /> Congratulations! You're Hired!</h4>
          
          <div className="hired-message">
            <h5>🎉 Welcome to the HireSuite Team! 🎉</h5>
            <p>We're thrilled to have you join us as our new <strong>{application.jobTitle}</strong>. Your skills and experience made you the perfect fit for this role!</p>
          </div>
          
          <div className="next-steps">
            <h5><CheckCircle size={20} /> Your Next Steps</h5>
            <ul className="onboarding-list">
              <li><Phone size={16} />HR will contact you within 2 business days</li>
              <li><FileText size={16} />Complete employment documentation</li>
              <li><Calendar size={16} />Schedule your orientation session</li>
              <li><Users size={16} />Meet your new team members</li>
              <li><Award size={16} />Begin your training program</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="flex items-center">
            <a href="#" className="logo">HireSuite</a>
          </div>

          <nav className="nav-desktop">
            <a href="#about" className="nav-link">About Us</a>
            <a href="#opportunities" className="nav-link">Opportunities</a>
            <a href="#apply" className="nav-link nav-apply-btn"><Briefcase size={16} /><span>Apply</span></a>
            <a href="#applications" className="nav-link nav-link-applications">
              <Bell size={16} />
                 <span className="status-text">My Applications</span>
                {statusBadgeCount > 0 && (
              <span className={`status-badge ${hasHiredStatus ? 'hired-badge' : ''}`}>
           {statusBadgeCount}
          </span>
           )}
           </a>
         

           <a href="#profile" className="nav-link nav-link-profile">
                <User size={20} />
               </a>

            <button onClick={handleLogout} className="nav-login" type="button">
              Logout
            </button>
          </nav>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-toggle">
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
          <nav className="mobile-nav">
            <button onClick={() => setMobileMenuOpen(false)} className="mobile-close">×</button>
            <a href="#about" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>About Us</a>
            <a href="#opportunities" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>Opportunities</a>
           <a href="#apply" className="nav-link nav-apply-btn"><Briefcase size={16} /> Apply</a>
            <a href="#applications" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              <Bell size={16} /> My Applications
            </a>
            <a href="#profile" className="mobile-link" onClick={() => setMobileMenuOpen(false)}>
              <User size={16} /> My Profile
            </a>
            <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="mobile-login">
              Logout
            </button>
          </nav>
        </>
      )}

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div className="confirm-modal" onClick={(e) => e.target.className === 'confirm-modal' && setLogoutModalOpen(false)}>
          <div className="confirm-content">
            <div className="confirm-icon logout-icon-modal">
              <span>⤴</span>
            </div>
            <div className="confirm-text">Are you sure you want to logout?</div>
            <div className="confirm-actions">
              <button 
                onClick={() => setLogoutModalOpen(false)}
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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Join the <span className="hero-highlight">HireSuite</span> Team</h1>
          <p className="hero-text">Discover opportunities to grow your career with one of the most innovative recruitment platforms</p>
          <div className="hero-buttons">
            <a href="#opportunities" className="btn-hero">Explore Benefits</a>
            <a href="#apply" className="btn-hero">View Openings</a>
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
            <h2 className="section-heading centered">Why Join Us?<span className="heading-underline centered"></span></h2>
            <p className="opportunities-text">At HireSuite, we believe that our team members are the foundation of our success.</p>
          </div>
          
          <div className="benefits-grid">
            <div className="benefit-card">
              <Briefcase className="benefit-icon" size={40} />
              <h3 className="benefit-title">Career Growth</h3>
              <p className="benefit-text">Comprehensive training programs and advancement pathways.</p>
            </div>
            <div className="benefit-card">
              <Heart className="benefit-icon" size={40} />
              <h3 className="benefit-title">Health Benefits</h3>
              <p className="benefit-text">Competitive health, dental, and vision insurance packages.</p>
            </div>
            <div className="benefit-card">
              <Clock className="benefit-icon" size={40} />
              <h3 className="benefit-title">Work-Life Balance</h3>
              <p className="benefit-text">Flexible scheduling and generous paid time off policies.</p>
            </div>
            <div className="benefit-card">
              <Award className="benefit-icon" size={40} />
              <h3 className="benefit-title">Professional Development</h3>
              <p className="benefit-text">Access to certifications, workshops, and learning opportunities.</p>
            </div>
            <div className="benefit-card">
              <Users className="benefit-icon" size={40} />
              <h3 className="benefit-title">Inclusive Culture</h3>
              <p className="benefit-text">A supportive environment where everyone's voice is valued.</p>
            </div>
            <div className="benefit-card">
              <DollarSign className="benefit-icon" size={40} />
              <h3 className="benefit-title">Competitive Pay</h3>
              <p className="benefit-text">Industry-leading salary packages with performance bonuses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* My Applications Section */}
      <section id="applications" className="applications-page-section">
        <div className="container">
          <div className="section-header-inline">
            <h2 className="section-heading">
              <Bell size={28} style={{ color: '#FFC107', marginRight: '0.5rem' }} />
              My Application Status
              <span className="heading-underline"></span>
            </h2>
            <button className="refresh-btn" onClick={loadApplications}>
              <RefreshCw size={16} /> Refresh Status
            </button>
          </div>
          
          <div className="applications-content">
            {applications.length === 0 ? (
              <div className="empty-status">
                <AlertCircle size={48} />
                <h3>No Applications Found</h3>
                <p>You haven't submitted any applications yet. Start by browsing our available positions!</p>
                <a href="#apply" className="nav-login btn-browse-jobs">
                  Browse Jobs
                </a>
              </div>
            ) : (
              <div className="status-list">
                {applications.map(app => <StatusCard key={app.appplication_id} application={app} />)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* My Profile Section */}
      <section id="profile" className="profile-page-section">
        <div className="container">
          <div className="section-header-inline">
            <h2 className="section-heading">
              My Profile
              <span className="heading-underline"></span>
            </h2>
            {!isEditingProfile ? (
              <button className="nav-login" onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
            ) : (
              <div className="profile-action-buttons">
                <button className="btn btn-secondary" onClick={() => { setIsEditingProfile(false); setResumeFile(null); loadProfile(); }}>Cancel</button>
                <button className="nav-login" onClick={saveProfile} disabled={saving}>Save Changes</button>
              </div>
            )}
          </div>

          <div className="profile-content">
            {/* Personal Information Section */}
            <div className="profile-section">
              <div className="section-title">Personal Information</div>
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name *</label>
                  <input type="text" name="firstName" value={profileData.firstName} onChange={handleProfileChange} disabled={!isEditingProfile} required />
                </div>
                <div className="form-group">
                  <label>Middle Name (Optional)</label>
                  <input type="text" name="middleName" value={profileData.middleName} onChange={handleProfileChange} disabled={!isEditingProfile} placeholder="Optional" />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input type="text" name="lastName" value={profileData.lastName} onChange={handleProfileChange} disabled={!isEditingProfile} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" value={profileData.email} onChange={handleProfileChange} disabled={!isEditingProfile} required />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input type="tel" name="phoneNumber" value={profileData.phoneNumber} onChange={handleProfileChange} disabled={!isEditingProfile} placeholder="+63 9XX XXX XXXX" required />
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input type="date" name="dateOfBirth" value={profileData.dateOfBirth} onChange={handleProfileChange} disabled={!isEditingProfile} required />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select name="gender" value={profileData.gender} onChange={handleProfileChange} disabled={!isEditingProfile} required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" name="age" value={profileData.age} disabled readOnly placeholder="Calculated from birth date" />
                </div>
                <div className="form-group full-width">
                  <label>Address *</label>
                  <textarea name="address" value={profileData.address} onChange={handleProfileChange} disabled={!isEditingProfile} rows="3" placeholder="Enter your full address" required />
                </div>
              </div>
            </div>

            {/* Resume Section */}
            <div className="profile-section">
              <div className="section-title">Resume * <span style={{ color: '#dc3545', fontSize: '0.9rem' }}>(Required for All Applications)</span></div>
              
              {!currentResume && !isEditingProfile && (
                <>
                  <div className="resume-mandatory-warning">
                    <AlertTriangle size={24} />
                    <span>A resume is mandatory for job applications. Please upload your resume before applying to any position.</span>
                  </div>
                  
                  <div className="file-upload-wrapper">
                    <label 
                      className={`file-upload-label
                         ${isDragging ? 'dragging' : ''}
                         ${!isEditingProfile ? ' disabled' : ''}
                         `}
                       onClick={() => {
                        if (!isEditingProfile) {
                            alert('Enable "Edit Profile" to upload your resume.');
                          }
                         }}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload size={48} />
                      <div className="file-upload-text">
                        <strong>Click to upload resume *</strong>
                        <small>or drag and drop</small>
                        <small>PDF, DOC, or DOCX (max 5MB) - REQUIRED</small>
                      </div>
                      <input type="file" accept=".pdf,.doc,.docx" 
                      onChange={handleResumeUpload}
                       style={{ display: 'none' }}
                          disabled={!isEditingProfile}  />
                    </label>
                  </div>
                </>
              )}

              {!isEditingProfile && currentResume && (
                <div className="current-resume-display">
                  <div className="resume-info">
                    <FileText size={24} />
                    <div>
                      <strong>Current Resume:</strong> {currentResume.fileName}
                      <br />
                      <small>Size: {(currentResume.fileSize / 1024 / 1024).toFixed(2)} MB</small>
                    </div>
                  </div>
                  <div className="resume-actions">
                    <button type="button" className="btn-small btn-view" onClick={viewResume}>
                      <Eye size={16} /> View
                    </button>
                  </div>
                </div>
              )}

              {isEditingProfile && (
                <>
                  {currentResume && !resumeFile && (
                    <div className="current-resume-display">
                      <div className="resume-info">
                        <FileText size={24} />
                        <div>
                          <strong>Current Resume:</strong> {currentResume.fileName}
                          <br />
                          <small>Size: {(currentResume.fileSize / 1024 / 1024).toFixed(2)} MB</small>
                        </div>
                      </div>
                      <div className="resume-actions">
                        <button type="button" className="btn-small btn-view" onClick={viewResume}>
                          <Eye size={16} /> View
                        </button>
                        <button type="button" className="btn-small btn-remove" onClick={removeResume}>
                          <Trash2 size={16} /> Remove
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="file-upload-wrapper">
                    <label 
                      className={`file-upload-label ${isDragging ? 'dragging' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload size={48} />
                      <div className="file-upload-text">
                        <strong>{resumeFile ? 'Change Resume' : currentResume ? 'Replace Resume' : 'Click to upload resume *'}</strong>
                        <small>or drag and drop</small>
                        <small>PDF, DOC, or DOCX (max 5MB) - REQUIRED</small>
                      </div>
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} style={{ display: 'none' }} />
                    </label>
                    {resumeFile && (
                      <div className="new-file-indicator">
                        <CheckCircle size={16} style={{ color: '#28a745' }} />
                        <span>New file selected: {resumeFile.name}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Apply Section - Job Listings */}
      <section id="apply" className="apply-section">
        <div className="container">
          <div className="apply-header">
            <h2 className="section-heading centered">Available Positions<span className="heading-underline centered"></span></h2>
            <p className="apply-text">Explore exciting career opportunities and join our growing team.</p>
          </div>

          {/* Filter Section */}
          <div className="filter-section-card">
            <div className="filter-header">
              <h3 className="filter-title">Filter Jobs</h3>
              <button onClick={loadJobs} className="refresh-jobs-btn">
                <RefreshCw size={16} /> Refresh Jobs
              </button>
            </div>
            <div className="filter-options-grid">
              <select 
                className="filter-select" 
                value={jobTypeFilter} 
                onChange={(e) => setJobTypeFilter(e.target.value)}
              >
                <option value="all">All Job Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
              <select 
                className="filter-select" 
                value={locationFilter} 
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option value="all">All Locations</option>
                <option value="office">Office</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
              <select 
                className="filter-select" 
                value={experienceFilter} 
                onChange={(e) => setExperienceFilter(e.target.value)}
              >
                <option value="all">All Experience Levels</option>
                <option value="0-2">0-2 Years</option>
                <option value="2-5">2-5 Years</option>
                <option value="5-8">5-8 Years</option>
                <option value="8+">8+ Years</option>
              </select>
            </div>
          </div>

          {/* Job Count */}
          <div className="job-count-display">
            {isLoadingJobs ? (
              'Loading jobs...'
            ) : filteredJobs.length === 0 ? (
              'No jobs match your current filters'
            ) : filteredJobs.length === 1 ? (
              '1 job opening available'
            ) : (
              `${filteredJobs.length} job openings available`
            )}
          </div>

          {/* Job List */}
          <div className="jobs-list-grid">
            {isLoadingJobs ? (
              <div className="loading-jobs">
                <RefreshCw size={48} className="spinning" />
                <p>Fetching latest job postings...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="empty-jobs-state">
                <Search size={64} />
                <h3>No Job Openings Available</h3>
                <p>We're always looking for talented individuals to join our team! Check back soon or follow us on social media for updates on new opportunities.</p>
                <button onClick={loadJobs} className="btn-refresh-empty">
                  <RefreshCw size={16} /> Check for New Jobs
                </button>
              </div>
            ) : (
              filteredJobs.map(job => (
                <div key={job.id} className="job-listing-card">
                  <div className="job-card-header">
                    <div>
                      <h3 className="job-card-title">{job.title}</h3>
                      <span className="job-type-badge">{job.type}</span>
                    </div>
                  </div>
                  <div className="job-card-details">
                    <div className="job-detail-item">
                      <MapPin size={16} />
                      <span>{job.location}</span>
                    </div>
                    <div className="job-detail-item">
                      <Briefcase size={16} />
                      <span>{job.experience}</span>
                    </div>
                    <div className="job-detail-item">
                      <Calendar size={16} />
                      <span>Posted: {job.datePosted}</span>
                    </div>
                  </div>
                  <div className="job-skills-section">
                    <div className="skills-heading">Required Skills:</div>
                    <div className="skills-tags">
                      {job.skills.map((skill, idx) => (
                        <span key={idx} className="skill-badge">{skill}</span>
                      ))}
                    </div>
                  </div>
                  <div className="job-description-section">
                    <div className="description-heading">Job Description:</div>
                    <p>{job.description}</p>
                  </div>
                  <div className="job-card-actions">

                    <button className={`btn-apply-job ${appliedJobs.includes(job.id) ? 'applied disabled' : ''}
                    `} 
                      disabled={appliedJobs.includes(job.id)}
                       title={appliedJobs.includes(job.id) ? 'You already applied to this job' : ''}                     
                      onClick={() => {
                        if (!appliedJobs.includes(job.id)) {
                          setSelectedJob(job);
                          setApplyModalOpen(true);
                        }
                      }}>
                     {appliedJobs.includes(job.id) ? (
                      <>
                       <CheckCircle size={16} style={{ marginRight: 6 }} />
                         Applied
                           </>
                        ) : (
                       'Apply Now'
                        )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {applyModalOpen && (
            <div 
              className="confirm-modal" 
              onClick={(e) => 
                e.target.className === "confirm-modal" && setApplyModalOpen(false)
              }
            >
              <div className="confirm-content">
                <div className="confirm-icon logout-icon-modal">
                  <span>📨</span>
                </div>

                <div className="confirm-text">
                  <h3>Confirm Application</h3>
                  <p>Are you sure you want to apply for <strong>{selectedJob.title}</strong>?</p>
                </div>

                <div className="confirm-actions">
                  <button className="btn btn-sm" onClick={() => setApplyModalOpen(false)}>
                    Cancel
                  </button>

                  <button className="btn btn-sm btn-post-job" onClick={confirmApplication}>
                    Confirm
                  </button>
                </div>
                
              </div>
            </div>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-logo">HireSuite</div>
          <p className="copyright">© 2025 HireSuite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ApplicantHomepage;