import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

// Import translations and i18n system
import { TAPi18n } from '/imports/i18n';

/**
 * SignUp Component
 * 
 * User registration component for creating new accounts.
 * Provides a clean, modern sign-up form with validation and error handling.
 */
const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Track current language and RTL status
  const { currentLanguage, isRTL } = useTracker(() => {
    return {
      currentLanguage: TAPi18n.getLanguage(),
      isRTL: TAPi18n.isRTL()
    };
  }, []);

  // Helper function to get translations
  const t = (key) => {
    return TAPi18n.__(key);
  };

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

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await new Promise((resolve, reject) => {
        Accounts.createUser({
          email: formData.email,
          password: formData.password,
          username: formData.username
        }, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      // Successful registration
      navigate('/');
    } catch (err) {
      setError(err.reason || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <div className="auth-container" style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div className="auth-header" style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            color: '#333', 
            marginBottom: '10px',
            fontSize: '28px',
            fontWeight: '600'
          }}>
            {t('signupPopup-title')}
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            {t('welcome-board')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="username" style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '500'
            }}>
              {t('username') || 'Username'}
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
                fontSize: '16px',
                transition: 'border-color 0.3s ease'
              }}
              placeholder={t('username')}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '500'
            }}>
              {t('email') || 'Email'}
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
                fontSize: '16px',
                transition: 'border-color 0.3s ease'
              }}
              placeholder={t('email')}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '500'
            }}>
              {t('password') || 'Password'}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px',
                transition: 'border-color 0.3s ease'
              }}
              placeholder={t('password')}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label htmlFor="confirmPassword" style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '500'
            }}>
              {t('password')}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px',
                transition: 'border-color 0.3s ease'
              }}
              placeholder={t('password')}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'background-color 0.3s ease'
            }}
          >
            {isLoading ? t('loading') : t('signupPopup-title')}
          </button>
        </form>

        <div className="auth-footer" style={{ 
          textAlign: 'center', 
          marginTop: '25px',
          paddingTop: '25px',
          borderTop: '1px solid #e0e0e0'
        }}>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            {t('if-you-already-have-an-account')}
          </p>
          <Link
            to="/sign-in"
            style={{
              color: '#2196F3',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '16px'
            }}
          >
            {t('loginPopup-title')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
