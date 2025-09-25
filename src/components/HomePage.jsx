import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get, set, update, onValue } from 'firebase/database';
import UserProfile from './UserProfile';
import '../styles/HomePage.css';

const HomePage = () => {
  // Profile menu state
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [accountInfo, setAccountInfo] = useState({ name: '', email: '' });
  // Fetch account info for profile dropdown
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      setAccountInfo({
        name: user.displayName || 'User',
        email: user.email || '',
      });
    } else {
      setAccountInfo({ name: '', email: '' });
    }
  }, [showProfileMenu]);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('request');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  // Fetch notifications from Firebase for the current user
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const db = getDatabase();
    const notifRef = ref(db, `notifications/${user.uid}`);
    // Listen for real-time updates
    const unsubscribe = onValue(notifRef, (snapshot) => {
      const notifs = [];
      snapshot.forEach(child => {
        notifs.push({ id: child.key, ...child.val() });
      });
      // Sort by createdAt descending
      notifs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setNotifications(notifs);
    });
    return () => unsubscribe();
  }, []);
  const bellRef = useRef();

  // Close dropdown on outside click and mark notifications as read
  useEffect(() => {
    function handleClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClick);
      // Mark all notifications as read when dropdown is opened
      const auth = getAuth();
      const user = auth.currentUser;
      if (user && notifications.some(n => n.unread)) {
        const db = getDatabase();
        const notifRef = ref(db, `notifications/${user.uid}`);
        notifications.forEach(n => {
          if (n.unread) {
            update(ref(db, `notifications/${user.uid}/${n.id}`), { unread: false });
          }
        });
      }
    } else {
      document.removeEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showNotifications, notifications]);
  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);
  const [currentImage, setCurrentImage] = useState(0);
  const [userType, setUserType] = useState('employer'); // Default value
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  
  // Images for the changing banner
  // Images for the changing banner (deprecated) - using CSS hero illustrations now
  const bannerImages = [];

  // Placeholder data for team members
  const teamMembers = [
    { name: 'Mansi Chauhan', role: 'Developer', image: '/images/me.jpg' },
   
  ];

  // Handle clicking on the banner to change image
  const handleBannerClick = () => {
    // preserve previous behavior: cycle through visual states
    setCurrentImage((prevImage) => (prevImage + 1) % 3);
  };

  // Change banner image automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevImage) => (prevImage + 1) % bannerImages.length);
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(interval);
  }, [bannerImages.length]);

  // Check authentication state and get user type
  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        // First check location state (for initial navigation)
        if (location.state?.userType) {
          setUserType(location.state.userType);
          fetchRequests(user.uid, location.state.userType);
        } else {
          // If no location state, fetch from database
          const fetchUserType = async () => {
            try {
              // Try to fetch from both possible paths
              const db = getDatabase();
              const employerRef = ref(db, `users/employer/${user.uid}`);
              const jobSeekerRef = ref(db, `users/jobSeeker/${user.uid}`);
              
              const employerSnapshot = await get(employerRef);
              const jobSeekerSnapshot = await get(jobSeekerRef);
              
              if (employerSnapshot.exists()) {
                setUserType('employer');
                fetchRequests(user.uid, 'employer');
              } else if (jobSeekerSnapshot.exists()) {
                setUserType('jobSeeker');
                fetchRequests(user.uid, 'jobSeeker');
              }
              // Default remains 'employer' if not found
            } catch (error) {
              console.error("Error fetching user type:", error);
            } finally {
              setIsLoading(false);
            }
          };
          
          fetchUserType();
        }
      } else {
        // User is not signed in, redirect to landing page
        navigate('/');
      }
    });
    
    return () => unsubscribe();
  }, [location.state, navigate]);

  // Fetch requests based on user type
  const fetchRequests = async (userId, type) => {
    try {
      const db = getDatabase();
      const requestsRef = ref(db, 'requests');
      
      // Get all requests
      const snapshot = await get(requestsRef);
      
      if (snapshot.exists()) {
        const allRequests = [];
        
        snapshot.forEach((childSnapshot) => {
          const request = {
            id: childSnapshot.key,
            ...childSnapshot.val()
          };
          
          // Filter requests based on user type
          if (type === 'jobSeeker' && request.jobSeekerId === userId) {
            allRequests.push(request);
          } else if (type === 'employer' && request.employerId === userId) {
            allRequests.push(request);
          }
        });
        
        if (type === 'jobSeeker') {
          setRequests(allRequests);
        } else {
          setSentRequests(allRequests);
        }
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceClick = (serviceType) => {
    // Handle click on service cards
    if (userType === 'jobSeeker') {
      // Check if the user has already completed their profile
      const auth = getAuth();
      const db = getDatabase();
      const userId = auth.currentUser.uid;
      const userProfileRef = ref(db, `users/${userId}/profile`);
      
      get(userProfileRef).then((snapshot) => {
        if (snapshot.exists() && 
            snapshot.val().firstName && 
            snapshot.val().lastName && 
            snapshot.val().phone) {
          // Profile is complete, navigate to service providers page
          navigate(`/service-providers/${serviceType}`);
        } else {
          // Profile is incomplete, navigate to profile page
          navigate(`/service/${serviceType}`);
        }
      }).catch((error) => {
        console.error("Error checking profile:", error);
        // Default to profile page if there's an error
        navigate(`/service/${serviceType}`);
      });
    } else {
      // For employers, show the service providers directly
      navigate(`/service-providers/${serviceType}`);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
  <div className="logo">HelperHub</div>
  <div style={{display:'flex',alignItems:'center',gap:'1.2rem',marginLeft:'auto'}}>
          {/* Dark mode toggle with SVG icon */}
          <button
            className="dark-toggle"
            aria-label="Toggle dark mode"
            onClick={() => setDarkMode((d) => !d)}
          >
            {darkMode ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 6.95-1.41-1.41M6.34 6.34 4.93 4.93m12.02 0-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>
            )}
          </button>
          {/* Notifications bell with SVG icon */}
          <div className="notif-bell-wrapper" ref={bellRef}>
            <button
              className="notif-bell"
              aria-label="Notifications"
              onClick={() => setShowNotifications((v) => !v)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
              {notifications.some(n => n.unread) && (
                <span className="notif-badge">{notifications.filter(n => n.unread).length}</span>
              )}
            </button>
            {showNotifications && (
              <div className="notif-dropdown">
                <div className="notif-dropdown-title">Notifications</div>
                {notifications.length === 0 ? (
                  <div className="notif-empty">No notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`notif-item${n.unread ? ' unread' : ''}`}>{n.text}</div>
                  ))
                )}
              </div>
            )}
          </div>
          {/* Profile avatar and dropdown */}
          <div className="profile-menu-wrapper">
            <button className="profile-avatar" aria-label="Profile Menu" onClick={() => setShowProfileMenu((v) => !v)}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M21 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/></svg>
            </button>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-title">Account</div>
                <div className="profile-account-info">
                  <div className="profile-account-name">{accountInfo.name}</div>
                  <div className="profile-account-email">{accountInfo.email}</div>
                </div>
                <button className="profile-link" onClick={()=>navigate('/dashboard')}>Dashboard</button>
                <button className="profile-link" onClick={()=>navigate('/applications')}>My Applications</button>
                <button className="profile-link" onClick={()=>navigate('/saved')}>Saved Jobs</button>
                <button className="profile-link" onClick={()=>navigate('/settings')}>Settings</button>
                <button className="profile-link logout" onClick={()=>{localStorage.clear();navigate('/')}}>Logout</button>
              </div>
            )}
          </div>
    </div>
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'request' ? 'active' : ''}`}
            onClick={() => setActiveTab('request')}
          >
            {userType === 'employer' ? 'Sent Requests' : 'Received Requests'}
          </button>
          <button 
            className={`nav-tab ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            Offers
          </button>
        </div>
        
  {/* Removed left-side My Account/UserProfile button as requested */}
      </nav>
      
      {/* Main content */}
      <main className="main-content">
        {/* User type indicator */}
        <div className="user-type-badge">
          {userType === 'employer' ? 'Employer' : 'Job Seeker'}
        </div>
        
        {/* Hero banner: CSS/SVG driven, no watermarked images */}
        <div className={`banner-container hero-variant-${currentImage}`} onClick={handleBannerClick}>
          <div
            className="banner-illustration"
            aria-hidden="true"
          />
          <div className="banner-slogan">
            <h1>Connecting People, Creating Opportunities</h1>
            <p>Find the right help or offer your services with HelperHub</p>
            <div className="hero-ctas">
              <button className="cta-primary" onClick={() => navigate('/get-started')}>Get Started</button>
              <button className="cta-secondary" onClick={() => navigate('/get-started')}>Learn More</button>
            </div>
          </div>
        </div>
        
        {/* Service Cards */}
        <div className="services-section">
          <h2>Our Services</h2>
          <div className="service-cards">
            <div className="service-card" onClick={() => handleServiceClick('short-term')}>
              <div className="card-image">
                <img src="/images/short-term.jpg" alt="Short Term Service" />
              </div>
              <h3>Short Term Service</h3>
              <button className="apply-button">Apply</button>
            </div>
          </div>
        </div>
        
        {/* Tab Content based on active tab */}
        <div className="tab-content">
          {activeTab === 'request' ? (
            <div className="request-section">
              <h2>{userType === 'employer' ? 'Your Sent Requests' : 'Requests From Employers'}</h2>
              
              {userType === 'jobSeeker' ? (
                // Display requests for job seekers
                requests.length > 0 ? (
                  <div className="requests-list">
                    {requests.map(request => (
                      <div key={request.id} className="request-card">
                        <div className="request-header">
                          <h3>Request from {request.employerName}</h3>
                          <span className={`request-status ${request.status}`}>{request.status}</span>
                        </div>
                        <div className="request-details">
                          <p><strong>Service:</strong> {request.serviceType === 'house' ? 'House Service' : 
                                                     request.serviceType === 'short-term' ? 'Short Term Service' : 
                                                     'Business Service'}</p>
                          <p><strong>Contact:</strong> {request.employerEmail} | {request.employerPhone}</p>
                          <p><strong>Date:</strong> {formatDate(request.createdAt)}</p>
                        </div>
                        <div className="request-actions">
                          <button className="accept-button">Accept</button>
                          <button className="decline-button">Decline</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">You haven't received any requests yet.</p>
                )
              ) : (
                // Display sent requests for employers
                sentRequests.length > 0 ? (
                  <div className="requests-list">
                    {sentRequests.map(request => (
                      <div key={request.id} className="request-card">
                        <div className="request-header">
                          <h3>Request to {request.jobSeekerName}</h3>
                          <span className={`request-status ${request.status}`}>{request.status}</span>
                        </div>
                        <div className="request-details">
                          <p><strong>Service:</strong> {request.serviceType === 'house' ? 'House Service' : 
                                                    request.serviceType === 'short-term' ? 'Short Term Service' : 
                                                    'Business Service'}</p>
                          <p><strong>Date:</strong> {formatDate(request.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">You haven't sent any requests yet.</p>
                )
              )}
            </div>
          ) : (
            <div className="received-section">
              <h2>Received Offers</h2>
              {/* This would be populated with actual received offers */}
              <p className="empty-state">You haven't received any offers yet.</p>
            </div>
          )}
        </div>
        
        {/* Team Section */}
        <div className="team-section">
          <h2>Developer</h2>
          <div className="team-members">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-member">
                <div className="member-image">
                  <img src={member.image} alt={member.name} />
                </div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h3>HelperHub</h3>
            <p>Connecting Helpers with Opportunities</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Services</h4>
              <ul>
                <li><a href="#">House Service</a></li>
                <li><a href="#">Short Term Service</a></li>
                <li><a href="#">Business Helper</a></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Safety</a></li>
                <li><a href="#">Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 HelperHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;