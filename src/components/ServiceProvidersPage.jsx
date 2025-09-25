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
  const { serviceType } = useParams();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userType, setUserType] = useState('');
  const [requestSent, setRequestSent] = useState({});
  const [requestLoading, setRequestLoading] = useState({});
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
  // Multiple selectable sub-services
  const [selectedSubServices, setSelectedSubServices] = useState([]);
  const [location, setLocation] = useState('');
  const auth = getAuth();

  // House help categories
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'maid', name: 'Maid/Housekeeping' },
    { id: 'babysitter', name: 'Babysitter' },
    { id: 'caregiver', name: 'Elderly Caregiver' },
    { id: 'cook', name: 'Cook' },
    { id: 'petcare', name: 'Pet Caretaker' },
    { id: 'gardener', name: 'Gardener' },
    { id: 'handyman', name: 'Handyman' }
  ];

  // Convert service type from URL parameter to a more readable format
  const getServiceTitle = () => {
    switch(serviceType) {
      case 'house':
        return 'House Service Providers';
      case 'short-term':
        return 'Short Term Service Providers';
      case 'business':
        return 'Business Service Providers';
      default:
        return 'Service Providers';
    }
  };

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
              // Check if the profile has the required service type
              // For house service, we check if they have selected categories
              if (serviceType === 'house' && 
                  user.profile.selectedCategories && 
                  user.profile.selectedCategories.length > 0) {
                
                // Add mock reviews for demonstration
                const mockReviews = generateMockReviews();
                
                providersData.push({
                  id: userId,
                  ...user.profile,
                  reviews: mockReviews,
                  averageRating: calculateAverageRating(mockReviews)
                });
              }
            }
          }
          
          setProviders(providersData);
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
  }, [serviceType]);

  // Generate mock reviews for demonstration
  const generateMockReviews = () => {
    const numberOfReviews = Math.floor(Math.random() * 5) + 1; // 1-5 reviews
    const reviews = [];
    
    for (let i = 0; i < numberOfReviews; i++) {
      reviews.push({
        id: `review-${i}`,
        userName: getRandomName(),
        rating: Math.floor(Math.random() * 5) + 1, // 1-5 stars
        comment: getRandomComment(),
        date: getRandomDate()
      });
    }
    
    return reviews;
  };

  // Helper function to calculate average rating
  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  // Random names for mock reviews
  const getRandomName = () => {
    const names = [
      'Isha Chauhan', 'Disha', 'Anu', 'Pratha',
      'Aditi', 'Tejas', 'Om', 'Lisa'
    ];
    return names[Math.floor(Math.random() * names.length)];
  };

  // Random comments for mock reviews
  const getRandomComment = () => {
    const comments = [
      'Excellent service! Very professional and reliable.',
      'Good work, but arrived a bit late.',
      'Great attitude and attention to detail.',
      'The service was satisfactory, would hire again.',
      'Very thorough and efficient, highly recommend!',
      'Pleasant to work with and did a good job overall.'
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  };

  // Random date within the last month
  const getRandomDate = () => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
    return pastDate.toLocaleDateString();
  };

  // Handle sending a service request
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
        jobSeekerCategories: provider.selectedCategories,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      
      // Show success message
      setRequestSent(prev => ({ ...prev, [provider.id]: true }));
      
      // Reset after 3 seconds
      setTimeout(() => {
        setRequestSent(prev => ({ ...prev, [provider.id]: false }));
      }, 3000);
      
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

  // Employer-side form
  if (userType === 'employer') {
    return (
      <div className="service-providers-container">
        <div className="service-providers-header">
          <div className="back-button" onClick={() => navigate('/home')}>
            <FaArrowLeft /> Back to Home
          </div>
          <h1>{getServiceTitle()}</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Buffering page */}
        {showBuffering ? (
          <div style={{ textAlign: 'center', margin: '4rem 0' }}>
            <h2 style={{ color: '#6c5ce7', marginBottom: '1.5rem' }}>Recommending service providers based on your profile/choices/needs...</h2>
            <div className="buffering-spinner" style={{ margin: '2rem auto', width: '60px', height: '60px', border: '6px solid #eee', borderTop: '6px solid #6c5ce7', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% {transform: rotate(360deg);} }`}</style>
          </div>
        ) : null}

        {/* Employer form and Apply button */}
        {!showBuffering && (
          <>
            <form className="employer-form" style={{ marginBottom: '2rem', background: '#f8f9fa', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h3>Choose Profession</h3>
              <select value={selectedProfession} disabled style={{ marginBottom: '1rem', padding: '8px', borderRadius: '5px', fontSize: '16px', background: '#e6e6fa', color: '#333', border: '1px solid #ccc' }}>
                <option value="electrician">Electrician</option>
              </select>

              <h3>Select Sub Services</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '1rem' }}>
                {subServicesList.map(sub => {
                  const isSelected = selectedSubServices.includes(sub);
                  return (
                    <div
                      key={sub}
                      className={`sub-service-box${isSelected ? ' selected' : ''}`}
                      style={{
                        background: isSelected ? '#6c5ce7' : '#f5f5f5',
                        color: isSelected ? 'white' : '#333',
                        border: isSelected ? '2px solid #5649c0' : '1px solid #ddd',
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
                        setSelectedSubServices(prev =>
                          prev.includes(sub)
                            ? prev.filter(s => s !== sub)
                            : [...prev, sub]
                        );
                      }}
                    >
                      {sub}
                    </div>
                  );
                })}
              </div>

              <h3>Location / Area</h3>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Enter location or area"
                style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px', background: '#fff', marginBottom: '1rem' }}
              />
            </form>
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
              onClick={() => {
                // Show buffering page
                setShowBuffering(true);
                // Simulate recommendation delay
                setTimeout(() => {
                  // Filter providers based on selected sub-services and location
                  const recommended = providers.filter(provider => {
                    // Provider must have matching location
                    const locationMatch = location && provider.location && provider.location.toLowerCase().includes(location.toLowerCase());
                    // Provider must have at least one matching sub-service and charges
                    const subMatch = selectedSubServices.some(sub =>
                      provider.selectedSubServices && provider.selectedSubServices.includes(sub) &&
                      provider.charges && provider.charges[sub] && provider.charges[sub] !== ''
                    );
                    return locationMatch && subMatch;
                  });
                  setRecommendedProviders(recommended);
                  setShowBuffering(false);
                }, 2000);
              }}
            >
              Apply
            </button>
          </>
        )}

        {/* Recommended Providers grid after buffering */}
        {!showBuffering && recommendedProviders.length > 0 && (
          <div className="providers-grid">
            <h2 style={{ textAlign: 'center', color: '#6c5ce7', marginBottom: '2rem' }}>Recommended Providers</h2>
            {recommendedProviders.map(provider => (
              <div key={provider.id} className="provider-card">
                <div className="provider-card-header">
                  <span className="badge badge-new">New</span>
                  <span className="badge badge-expert">Expert</span>
                  <button className="icon-btn bookmark-btn" title="Save/Bookmark">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  </button>
                  <button className="icon-btn share-btn" title="Share">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98"/><path d="M15.41 6.51l-6.82 3.98"/></svg>
                  </button>
                  <button className="icon-btn quickview-btn" title="Quick View">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M2.05 12a9.94 9.94 0 0 1 19.9 0 9.94 9.94 0 0 1-19.9 0z"/></svg>
                  </button>
                </div>
                <div className="provider-card-body">
                  <div className="provider-info">
                    <div className="provider-name">{provider.firstName} {provider.lastName}</div>
                    <div className="provider-role">{provider.selectedCategories?.[0] || 'Service Provider'}</div>
                  </div>
                  <div className="provider-actions">
                    <button className="apply-btn">Apply</button>
                    <button className="message-btn">Message</button>
                  </div>
                </div>
              </div>
            ))}
            {recommendedProviders.length === 0 && (
              <div className="no-providers-message">
                <p>No recommended providers found for your choices.</p>
              </div>
            )}
          </div>
        )}

        {/* Providers grid below form */}
        <div className="providers-grid">
          {filteredProviders.length > 0 ? (
            filteredProviders.map(provider => (
              <div key={provider.id} className="provider-card">
                {/* ...existing provider card code... */}
                {/* ...existing code... */}
              </div>
            ))
          ) : (
            <div className="no-providers-message">
              <p>No service providers found for this category.</p>
              <p>Be the first to offer this service by updating your profile!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Job seeker side (default)
  return (
    <div className="service-providers-container">
      <div className="service-providers-header">
        <div className="back-button" onClick={() => navigate('/home')}>
          <FaArrowLeft /> Back to Home
        </div>
        <h1>{getServiceTitle()}</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filter-section">
        <h3>Filter by Category:</h3>
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-filter ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="providers-grid">
        {filteredProviders.length > 0 ? (
          filteredProviders.map(provider => (
            <div key={provider.id} className="provider-card">
              {/* ...existing provider card code... */}
              {/* ...existing code... */}
            </div>
          ))
        ) : (
          <div className="no-providers-message">
            <p>No service providers found for this category.</p>
            <p>Be the first to offer this service by updating your profile!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceProvidersPage;