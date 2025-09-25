
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import SignupPage from './components/SignupPage';
import HomePage from './components/HomePage';
import GetStartedPage from './components/GetStartedPage';
import AboutPage from './components/AboutPage';
import ProfilePage from './components/ProfilePage';
import ServiceProvidersPage from './components/ServiceProvidersPage';
import SettingsPage from './components/SettingsPage';
import DashboardPage from './components/DashboardPage';
import SavedJobsPage from './components/SavedJobsPage';
import MyApplicationsPage from './components/MyApplicationsPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/saved" element={<SavedJobsPage />} />
          <Route path="/applications" element={<MyApplicationsPage />} />
          <Route path="/get-started" element={<GetStartedPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/edit-profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/service/:serviceType" element={<ProfilePage />} />
          <Route path="/service-providers/:serviceType" element={<ServiceProvidersPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;