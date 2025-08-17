import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Profile Component
 * 
 * User profile management component for viewing and editing profile information.
 * Provides a clean interface for profile management.
 */
const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track current user data
  const { currentUser } = useTracker(() => {
    return {
      currentUser: Meteor.user()
    };
  }, []);

  // Initialize form data when user data is available
  React.useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.emails?.[0]?.address || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Update profile logic would go here
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Meteor.logout(() => {
      navigate('/sign-in');
    });
  };

  if (!currentUser) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <div className="profile-page" style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div className="profile-container" style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {/* Profile Header */}
        <div className="profile-header" style={{
          backgroundColor: '#2196F3',
          color: 'white',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div className="profile-avatar" style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            fontWeight: 'bold'
          }}>
            {currentUser.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h1 style={{ margin: '0 0 10px', fontSize: '28px' }}>
            {currentUser.username || 'User'}
          </h1>
          <p style={{ margin: 0, opacity: 0.9 }}>
            {currentUser.emails?.[0]?.address || 'No email'}
          </p>
        </div>

        {/* Profile Content */}
        <div className="profile-content" style={{ padding: '40px' }}>
          {error && (
            <div className="error-message" style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message" style={{
              backgroundColor: '#e8f5e8',
              color: '#2e7d32',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {success}
            </div>
          )}

          <div className="profile-actions" style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '30px'
          }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                padding: '10px 20px',
                backgroundColor: isEditing ? '#f44336' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            
            <button
              onClick={handleLogout}
              style={{
                padding: '10px 20px',
                backgroundColor: '#757575',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label htmlFor="username" style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '25px' }}>
                <label htmlFor="email" style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#333',
                  fontWeight: '500'
                }}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-group" style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#666',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Username
                </label>
                <p style={{
                  margin: 0,
                  fontSize: '18px',
                  color: '#333',
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px'
                }}>
                  {currentUser.username || 'Not set'}
                </p>
              </div>

              <div className="info-group" style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#666',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Email
                </label>
                <p style={{
                  margin: 0,
                  fontSize: '18px',
                  color: '#333',
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px'
                }}>
                  {currentUser.emails?.[0]?.address || 'Not set'}
                </p>
              </div>

              <div className="info-group" style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#666',
                  fontSize: '14px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Member Since
                </label>
                <p style={{
                  margin: 0,
                  fontSize: '18px',
                  color: '#333',
                  padding: '12px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '6px'
                }}>
                  {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
