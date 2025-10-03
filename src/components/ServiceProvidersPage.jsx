import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDatabase, ref, get, push, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { FaArrowLeft, FaStar, FaRegStar, FaPhone, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import '../styles/ServiceProvidersPage.css';

const ServiceProvidersPage = () => {
  // Buffering and recommendation state
  const [showBuffering, setShowBuffering] = useState(false);
  const [recommendedProviders, setRecommendedProviders] = useState([]);
  // Only use 'short-term' service type
  const serviceType = 'short-term';
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userType, setUserType] = useState('');
  const [requestSent, setRequestSent] = useState({});
  const [requestLoading, setRequestLoading] = useState({});
  const [requestDisabled, setRequestDisabled] = useState({});
  // Employer-side form state
  const [selectedProfession, setSelectedProfession] = useState('electrician');
  const subServicesList = [
    'Fan Install',
    'Switch Board',
    'DB Install',
    'MCB Install',
    'TV Fitting',
    'Full House Wiring',
    'Diwali Lighting',
    'Ganesh Pandal Wiring'
  ];
  // Multi-select for sub-services
  const [selectedSubServices, setSelectedSubServices] = useState([]);
  const [location, setLocation] = useState('');
  // Move filtered providers/applied state up so it persists
  const [filteredEmployerProviders, setFilteredEmployerProviders] = useState([]);
  const [applied, setApplied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const auth = getAuth();

  // Remove house help categories (only show Electrician)
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'electrician', name: 'Electrician' }
  ];

  // Convert service type from URL parameter to a more readable format
  const getServiceTitle = () => 'Short Term Service Providers';

  useEffect(() => {
    // Fetch current user type
    const checkUserType = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/');
          return;
        }

        const db = getDatabase();
        const employerRef = ref(db, `users/employer/${currentUser.uid}`);
        const jobSeekerRef = ref(db, `users/jobSeeker/${currentUser.uid}`);
        
        const employerSnapshot = await get(employerRef);
        const jobSeekerSnapshot = await get(jobSeekerRef);
        
        if (employerSnapshot.exists()) {
          setUserType('employer');
        } else if (jobSeekerSnapshot.exists()) {
          setUserType('jobSeeker');
        }
      } catch (error) {
        console.error("Error checking user type:", error);
      }
    };

    checkUserType();
  }, [auth, navigate]);

  useEffect(() => {
    const fetchServiceProviders = async () => {
      try {
        const db = getDatabase();
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);

        if (snapshot.exists()) {
          const data = snapshot.val();
          const providersData = [];

          // Loop through all users
          for (const userId in data) {
            const user = data[userId];

            // Check if profile exists and if it's a job seeker
            if (user.profile && user.profile.userType === 'jobSeeker') {
              // Only keep job seekers with selectedCategories in short-term
              if (user.profile.selectedCategories && user.profile.selectedCategories.length > 0) {
                providersData.push({
                  id: userId,
                  ...user.profile
                });
              }
            }
          }

          setProviders(providersData);

          // Check for existing requests to disable buttons
          const currentUser = auth.currentUser;
          if (currentUser) {
            const requestsRef = ref(db, 'requests');
            const requestsSnapshot = await get(requestsRef);
            if (requestsSnapshot.exists()) {
              const requestsData = requestsSnapshot.val();
              const disabledMap = {};
              for (const reqId in requestsData) {
                const req = requestsData[reqId];
                if (req.employerId === currentUser.uid) {
                  disabledMap[req.jobSeekerId] = true;
                }
              }
              setRequestDisabled(disabledMap);
            }
          }
        } else {
          console.log("No service providers found");
          setProviders([]);
        }
      } catch (error) {
        console.error("Error fetching service providers:", error);
        setError("Failed to load service providers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchServiceProviders();
  }, []); // No dependency on serviceType



  // Handle sending a service request
  const handleSendRequest = async (provider) => {
    try {
      setRequestLoading(prev => ({ ...prev, [provider.id]: true }));
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be logged in to send a request");
      }
      
      // Fetch minimal employer profile info
      const db = getDatabase();
      const userProfileRef = ref(db, `users/${currentUser.uid}/profile`);
      const profileSnapshot = await get(userProfileRef);
      
      // If profile doesn't exist, use basic auth user info
      const employerProfile = profileSnapshot.exists() ? profileSnapshot.val() : {
        firstName: currentUser.displayName || 'Employer',
        lastName: '',
        email: currentUser.email,
        phone: currentUser.phoneNumber || 'Not provided'
      };
      
      // Create request in the database
      const requestsRef = ref(db, 'requests');
      const newRequestRef = push(requestsRef);
      
      await set(newRequestRef, {
        employerId: currentUser.uid,
        jobSeekerId: provider.id,
        serviceType: serviceType,
        employerName: `${employerProfile.firstName} ${employerProfile.lastName}`.trim(),
        employerEmail: employerProfile.email,
        employerPhone: employerProfile.phone,
        jobSeekerName: `${provider.firstName} ${provider.lastName}`,
        jobSeekerEmail: provider.email,
        jobSeekerPhone: provider.phone,
        jobSeekerCategories: provider.selectedCategories,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      
      // Show success message and disable button
      setRequestSent(prev => ({ ...prev, [provider.id]: true }));
      setRequestDisabled(prev => ({ ...prev, [provider.id]: true }));
      
    } catch (error) {
      console.error("Error sending request:", error);
      alert(error.message || "Failed to send request. Please try again.");
    } finally {
      setRequestLoading(prev => ({ ...prev, [provider.id]: false }));
    }
  };

  // Filter providers based on selected category
  const filteredProviders = providers.filter(provider => {
    if (selectedCategory === 'all') return true;
    return provider.selectedCategories && provider.selectedCategories.includes(selectedCategory);
  });

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else {
        stars.push(<FaRegStar key={i} className="star" />);
      }
    }
    
    return stars;
  };

  if (loading) {
    return <div className="loading-screen">Loading service providers...</div>;
  }

  if (isBuffering) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          fontSize: '1.5rem',
          fontWeight: '500',
          color: '#6c5ce7'
        }}
      >
        <div className="spinner"></div>
        Recommending Professionals based on Your Interests
      </div>
    );
  }

  // Filtering logic for employer side
  const handleEmployerApply = () => {
    if (selectedSubServices.length === 0) {
      alert("Please select at least one sub service.");
      return;
    }
    setIsBuffering(true);
    setTimeout(() => {
      // Filter job seekers by selected category, sub-services and area
      const filtered = providers.filter(provider => {
        const matchesCategory = selectedCategory === 'all' || (provider.selectedCategories && provider.selectedCategories.includes(selectedCategory));
        const matchesSubService = selectedSubServices.length === 0 || (provider.selectedSubServices && selectedSubServices.every(sub => provider.selectedSubServices.some(pss => pss.name.replace(' (₹)', '') === sub)));
        const matchesArea = !location || ((provider.area && provider.area.toLowerCase().includes(location.toLowerCase())) || (provider.address && provider.address.toLowerCase().includes(location.toLowerCase())));
        return matchesCategory && matchesSubService && matchesArea;
      });
      setFilteredEmployerProviders(filtered);
      setApplied(true);
      setIsBuffering(false);
    }, 2500); // 2.5 seconds buffering
  };

  // UI
  return (
    <div className="service-providers-container">
      <div className="service-providers-header">
        <div className="back-button" onClick={() => navigate('/home')}>
          <FaArrowLeft /> Back to Home
        </div>
        <h1>Service Providers</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Profession selection - only Electrician, box style, selected by default */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Select Profession</h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div
            className="profession-box selected"
            style={{
              background: '#6c5ce7',
              color: 'white',
              border: '2px solid #5649c0',
              borderRadius: '10px',
              padding: '18px 32px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '180px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: '2px solid #6c5ce7'
            }}
          >
            Electrician
          </div>
        </div>
      </div>

      {/* Sub Service selection */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Select Sub Service</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {subServicesList.map(sub => (
            <div
              key={sub}
              className={`sub-service-box${selectedSubServices.includes(sub) ? ' selected' : ''}`}
              style={{
                background: selectedSubServices.includes(sub) ? '#6c5ce7' : '#f5f5f5',
                color: selectedSubServices.includes(sub) ? 'white' : '#333',
                border: selectedSubServices.includes(sub) ? '2px solid #5649c0' : '1px solid #ddd',
                borderRadius: '8px',
                padding: '14px 18px',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                minWidth: '140px',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => {
                if (selectedSubServices.includes(sub)) {
                  setSelectedSubServices(selectedSubServices.filter(s => s !== sub));
                } else {
                  setSelectedSubServices([...selectedSubServices, sub]);
                }
              }}
            >
              {sub}
            </div>
          ))}
        </div>
      </div>

      {/* Location input */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Location / Area</h3>
        <input
          type="text"
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Enter location or area"
          style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px', background: '#fff', marginBottom: '1rem' }}
        />
      </div>

      <button
        className="apply-button"
        style={{
          display: 'block',
          width: '200px',
          margin: '0 auto 2rem auto',
          padding: '0.8rem',
          backgroundColor: '#6c5ce7',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          fontWeight: '500',
          fontSize: '1.1rem',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease'
        }}
        onClick={handleEmployerApply}
      >
        Search
      </button>

      {/* Providers grid below form */}
      {applied && (
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#6c5ce7' }}>
          Top Recommendations For You
        </h2>
      )}
      <div className="providers-grid">
        {applied ? (
          filteredEmployerProviders.length > 0 ? (
            filteredEmployerProviders.map(provider => (
              <div key={provider.id} className="provider-card">
                <div className="provider-header">
                  <div className="provider-image">
                    {provider.photoUrl ? (
                      <img src={provider.photoUrl} alt={provider.firstName} />
                    ) : (
                      <div className="default-avatar">{provider.name ? provider.name[0] : (provider.firstName ? provider.firstName[0] : '?')}</div>
                    )}
                  </div>
                  <div className="provider-info">
                    <h3>{provider.name ? provider.name : `${provider.firstName || ''} ${provider.lastName || ''}`.trim()}</h3>
                    <div className="provider-categories">
                      {provider.selectedCategories && provider.selectedCategories.map(cat => (
                        <span key={cat} className="category-tag">{cat}</span>
                      ))}
                    </div>
                    <div className="provider-role">{provider.role}</div>
                    <div className="provider-area">Area: {provider.area || provider.address || 'N/A'}</div>
                  </div>
                </div>
                <div className="provider-bio">{provider.bio}</div>
                <div className="provider-services">
                  <h4>Services Offered:</h4>
                  <div className="services-list">
                    {provider.selectedSubServices && provider.selectedSubServices.map((service, index) => (
                      <span
                        key={index}
                        className="service-tag"
                        style={{
                          background: '#6c5ce7',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          margin: '2px',
                          display: 'inline-block'
                        }}
                      >
                        {service.name.replace(' (₹)', '')}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="provider-contact">
                  <button
                    className="view-profile-button"
                    style={{
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      marginRight: '0.5rem'
                    }}
                    onClick={() => {
                      setSelectedProvider(provider);
                      setShowModal(true);
                    }}
                  >
                    View Profile
                  </button>
                  <button
                    className="contact-button"
                    onClick={() => handleSendRequest(provider)}
                    disabled={requestDisabled[provider.id] || requestLoading[provider.id]}
                  >
                    <FaPaperPlane /> {requestDisabled[provider.id] ? 'Request Sent' : requestLoading[provider.id] ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-providers-message">
              <p>No service providers found matching your criteria.</p>
            </div>
          )
        ) : null}
      </div>

      {/* Modal for viewing profile details */}
      {showModal && selectedProvider && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '10px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Service Provider Details</h2>
            <p><strong>Name:</strong> {selectedProvider.name ? selectedProvider.name : `${selectedProvider.firstName || ''} ${selectedProvider.lastName || ''}`.trim()}</p>
            <h3>Service Charges:</h3>
            <ul>
              {selectedProvider.selectedSubServices && selectedProvider.selectedSubServices.map((service, index) => (
                <li key={index}>
                  {service.name}: {service.charge}
                </li>
              ))}
            </ul>
            <button
              style={{
                backgroundColor: '#6c5ce7',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceProvidersPage;
