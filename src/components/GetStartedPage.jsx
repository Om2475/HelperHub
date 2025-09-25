import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

const GetStartedPage = () => {
  const navigate = useNavigate();
  return (
    <div className="get-started-container" style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--color-bg)',color:'var(--color-text)'}}>
      <div className="get-started-card" style={{background:'rgba(255,255,255,0.95)',padding:'2.5rem 2rem',borderRadius:'18px',boxShadow:'0 8px 32px rgba(0,0,0,0.08)',maxWidth:'420px',width:'100%',textAlign:'center'}}>
        <h1 style={{fontSize:'2.2rem',fontWeight:800,marginBottom:'1.2rem',background:'linear-gradient(135deg,#667eea,#764ba2)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Welcome to HelperHub!</h1>
        <p style={{fontSize:'1.15rem',marginBottom:'2rem',color:'#444'}}>Find the right help, offer your skills, or grow your business. Get started in just a few steps.</p>
        <button className="cta-primary" style={{width:'100%',marginBottom:'1.1rem'}} onClick={()=>navigate('/signup')}>Sign Up / Login</button>
        <button className="cta-secondary" style={{width:'100%',marginBottom:'1.1rem'}} onClick={()=>navigate('/home')}>Explore as Guest</button>
  <button className="cta-secondary" style={{width:'100%'}} onClick={()=>navigate('/about')}>Learn More</button>
      </div>
    </div>
  );
};

export default GetStartedPage;
