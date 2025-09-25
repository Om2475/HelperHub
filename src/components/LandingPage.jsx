// components/LandingPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [animationState, setAnimationState] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationState((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUserTypeSelection = (userType) => {
    navigate('/signup', { state: { userType } });
  };

  return (
    <div className="landing-container">
      <div className="left-section">
        <div className="animation-container">
          <div className={`animation-item ${animationState === 0 ? 'active' : ''}`}>
            <div className="illustration">
              {/* Clean SVG illustration - connecting people */}
              <svg width="420" height="300" viewBox="0 0 420 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="420" height="300" rx="20" fill="url(#g1)" />
                <g opacity="0.95">
                  <circle cx="110" cy="160" r="34" fill="#fff" opacity="0.12" />
                  <circle cx="310" cy="110" r="44" fill="#fff" opacity="0.14" />
                  <path d="M80 230c40-50 140-50 180 0" stroke="#ffffff66" strokeWidth="6" strokeLinecap="round" />
                </g>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#7b61ff" />
                    <stop offset="1" stopColor="#4cc9f0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3>Connecting Skills with Opportunities</h3>
            <p>HelperHub bridges the gap between informal workers and employers</p>
          </div>
          <div className={`animation-item ${animationState === 1 ? 'active' : ''}`}>
            <div className="illustration">
              {/* Secure shield SVG */}
              <svg width="420" height="300" viewBox="0 0 420 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="420" height="300" rx="20" fill="url(#g2)" />
                <g opacity="0.98" transform="translate(60,40)">
                  <path d="M150 10L190 30V70C190 110 150 150 110 170C70 150 30 110 30 70V30L70 10" fill="#ffffff22" stroke="#fff" strokeWidth="4" />
                  <path d="M110 70L130 90L170 50" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <defs>
                  <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#4cc9f0" />
                    <stop offset="1" stopColor="#2b6cb0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3>Safe & Secure Platform</h3>
            <p>Verified profiles and secure payment options for everyone</p>
          </div>
          <div className={`animation-item ${animationState === 2 ? 'active' : ''}`}>
            <div className="illustration">
              {/* Growth / upward trend SVG */}
              <svg width="420" height="300" viewBox="0 0 420 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="420" height="300" rx="20" fill="url(#g3)" />
                <g transform="translate(40,40)" stroke="#fff" strokeWidth="6" strokeLinecap="round">
                  <polyline points="0 190 70 120 140 150 210 80 280 110" fill="none" stroke="#ffffffbb" />
                </g>
                <defs>
                  <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#f6d365" />
                    <stop offset="1" stopColor="#fda085" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h3>Grow Your Skills & Business</h3>
            <p>Training opportunities for workers and reliable hiring for businesses</p>
          </div>
        </div>
      </div>

      
      
      <div className="right-section">
        <div className="logo-container">
          <h1>HelperHub</h1>
          <p className="tagline">Connecting Helpers with Opportunities</p>
        </div>
        
        <div className="user-type-selection">
          <h2>I am a...</h2>
          
          <div className="button-container">
            <button 
              className="user-type-button employer-button"
              onClick={() => handleUserTypeSelection('employer')}
            >
              <i className="user-icon">🏢</i>
              <span>Employer</span>
              <p className="button-description">Looking to hire reliable help</p>
            </button>
            
            <button 
              className="user-type-button job-seeker-button"
              onClick={() => handleUserTypeSelection('jobSeeker')}
            >
              <i className="user-icon">👷</i>
              <span>Job Seeker</span>
              <p className="button-description">Looking for work opportunities</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
