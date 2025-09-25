import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, updatePassword, signOut } from 'firebase/auth';
import { getDatabase, ref, get, update } from 'firebase/database';
import { FaArrowLeft, FaUser, FaBell, FaLock, FaEye, FaPalette, FaGlobe, FaTrash } from 'react-icons/fa';
import '../styles/SettingsPage.css';

const SettingsPage = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [activeTab, setActiveTab] = useState('appearance');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // User settings state
  const [settings, setSettings] = useState({
    // Appearance settings
    theme: 'system',
    fontSize: 'medium',
    animations: true,
    
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    requestNotifications: true,
    marketingEmails: false,
    
    // Privacy settings
    profileVisibility: 'public',
    showEmail: false,
    showPhone: true,
    allowMessages: true,
    
    // Account settings
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const db = getDatabase();
        const settingsRef = ref(db, `users/${user.uid}/settings`);
        const snapshot = await get(settingsRef);
        
        if (snapshot.exists()) {
          setSettings(prev => ({ ...prev, ...snapshot.val() }));
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (user) {
        const db = getDatabase();
        const settingsRef = ref(db, `users/${user.uid}/settings`);
        await update(settingsRef, settings);
        
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, passwordData.newPassword);
        setSuccess('Password updated successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      setError(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (confirmed) {
      const doubleConfirmed = window.confirm(
        'This will permanently delete all your data. Type "DELETE" in the next prompt to confirm.'
      );
      
      if (doubleConfirmed) {
        const userInput = window.prompt('Type "DELETE" to confirm account deletion:');
        
        if (userInput === 'DELETE') {
          try {
            setLoading(true);
            const user = auth.currentUser;
            
            if (user) {
              // Delete user data from database
              const db = getDatabase();
              const userRef = ref(db, `users/${user.uid}`);
              await update(userRef, null);
              
              // Delete authentication account
              await user.delete();
              
              // Sign out and redirect
              await signOut(auth);
              navigate('/');
            }
          } catch (error) {
            console.error('Error deleting account:', error);
            setError('Failed to delete account. Please contact support.');
            setLoading(false);
          }
        }
      }
    }
  };

  const tabs = [
    { id: 'appearance', name: 'Appearance', icon: FaPalette },
    { id: 'notifications', name: 'Notifications', icon: FaBell },
    { id: 'privacy', name: 'Privacy', icon: FaEye },
    { id: 'account', name: 'Account', icon: FaLock }
  ];

  return (
    <div className="settings-page-container">
      <div className="settings-header">
        <div className="back-button" onClick={() => navigate('/home')}>
          <FaArrowLeft /> Back to Home
        </div>
        <h1>Settings</h1>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-content">
        {/* Sidebar */}
        <div className="settings-sidebar">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <IconComponent />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="settings-main">
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h2>Appearance Settings</h2>
              
              <div className="setting-item">
                <div className="setting-label">
                  <h3>Theme</h3>
                  <p>Choose your preferred color scheme</p>
                </div>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('appearance', 'theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <h3>Font Size</h3>
                  <p>Adjust text size for better readability</p>
                </div>
                <select
                  value={settings.fontSize}
                  onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <h3>Animations</h3>
                  <p>Enable smooth animations and transitions</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.animations}
                    onChange={(e) => handleSettingChange('appearance', 'animations', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Preferences</h2>
              
              <div className="setting-item">
                <div className="setting-label">
                  <h3>Email Notifications</h3>
                  <p>Receive notifications via email</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <h3>Push Notifications</h3>
                  <p>Receive browser push notifications</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <h3>Service Requests</h3>
                  <p>Get notified about new service requests</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.requestNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'requestNotifications', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <h3>Marketing Emails</h3>
                  <p>Receive promotional emails and updates</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.marketingEmails}
                    onChange={(e) => handleSettingChange('notifications', 'marketingEmails', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy Settings</h2>
              
              <div className="setting-item">
                <div className="setting-label">
                  <h3>Profile Visibility</h3>
                  <p>Who can see your profile information</p>
                </div>
                <select
                  value={settings.profileVisibility}
                  onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="members">Members Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <h3>Show Email Address</h3>
                  <p>Display your email on your public profile</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.showEmail}
                    onChange={(e) => handleSettingChange('privacy', 'showEmail', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <h3>Show Phone Number</h3>
                  <p>Display your phone number on your public profile</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.showPhone}
                    onChange={(e) => handleSettingChange('privacy', 'showPhone', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <h3>Allow Direct Messages</h3>
                  <p>Let other users send you direct messages</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.allowMessages}
                    onChange={(e) => handleSettingChange('privacy', 'allowMessages', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>Account Security</h2>
              
              {/* Password Change Section */}
              <div className="password-section">
                <h3>Change Password</h3>
                <form onSubmit={handlePasswordChange}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <button type="submit" className="change-password-button" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => handleSettingChange('account', 'twoFactorAuth', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <h3>Login Alerts</h3>
                  <p>Get notified of new login attempts</p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={settings.loginAlerts}
                    onChange={(e) => handleSettingChange('account', 'loginAlerts', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <h3>Session Timeout</h3>
                  <p>Automatically log out after inactivity (minutes)</p>
                </div>
                <select
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('account', 'sessionTimeout', parseInt(e.target.value))}
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={0}>Never</option>
                </select>
              </div>

              {/* Danger Zone */}
              <div className="danger-zone">
                <h3>Danger Zone</h3>
                <button className="delete-account-button" onClick={deleteAccount}>
                  <FaTrash />
                  Delete Account
                </button>
                <p>Once you delete your account, there is no going back. Please be certain.</p>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="settings-actions">
            <button className="save-settings-button" onClick={saveSettings} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;