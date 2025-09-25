import React from 'react';

const AboutPage = () => (
  <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'var(--color-bg)',color:'var(--color-text)',padding:'2rem'}}>
    <div style={{maxWidth:'700px',background:'rgba(255,255,255,0.97)',borderRadius:'18px',boxShadow:'0 8px 32px rgba(0,0,0,0.08)',padding:'2.5rem 2rem',textAlign:'center'}}>
      <h1 style={{fontSize:'2.2rem',fontWeight:800,marginBottom:'1.2rem',background:'linear-gradient(135deg,#667eea,#764ba2)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>About HelperHub</h1>
      <p style={{fontSize:'1.15rem',marginBottom:'1.5rem',color:'#444'}}>HelperHub is a platform dedicated to connecting job seekers and employers in the informal sector. Our mission is to empower individuals, simplify hiring, and create new opportunities for everyone.</p>
      <ul style={{textAlign:'left',margin:'0 auto 1.5rem auto',maxWidth:'500px',color:'#333',fontSize:'1.08rem'}}>
        <li>✔️ Easy sign up for both job seekers and employers</li>
        <li>✔️ Secure, verified profiles and safe communication</li>
        <li>✔️ Fast matching for short-term, house, and business services</li>
        <li>✔️ Profile completion and skill-building features</li>
        <li>✔️ Transparent feedback and ratings</li>
      </ul>
      <p style={{color:'#555'}}>Whether you’re looking for work or need to hire, HelperHub is here to help you connect, grow, and succeed.</p>
    </div>
  </div>
);

export default AboutPage;
