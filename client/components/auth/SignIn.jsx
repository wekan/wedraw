import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

// Import translations and i18n system
import { TAPi18n } from '/imports/i18n';
import { Auth } from '/imports/utils/auth';

/**
 * SignIn Component
 * 
 * User authentication component for signing into the application.
 * Provides a clean, modern sign-in form with error handling.
 */
const SignIn = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputType, setInputType] = useState('username-or-email');
  const navigate = useNavigate();

  // Track current language and RTL status
  const { currentLanguage, isRTL, isI18nReady } = useTracker(() => {
    return {
      currentLanguage: TAPi18n && TAPi18n.getLanguage ? TAPi18n.getLanguage() : 'en',
      isRTL: TAPi18n && TAPi18n.isRTL ? TAPi18n.isRTL() : false,
      isI18nReady: TAPi18n && TAPi18n.i18n && TAPi18n.i18n.isInitialized
    };
  }, []);

  // Helper function to get translations
  const t = (key) => {
    try {
      return TAPi18n && TAPi18n.__ ? TAPi18n.__(key) : key;
    } catch (error) {
      console.warn('Translation error:', error);
      return key;
    }
  };

  // Update input type based on input value
  useEffect(() => {
    if (!usernameOrEmail) {
      setInputType('username-or-email');
    } else if (Auth.isEmail(usernameOrEmail)) {
      setInputType('email');
    } else if (Auth.isUsername(usernameOrEmail)) {
      setInputType('username');
    }
  }, [usernameOrEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    console.log('Login attempt started for:', usernameOrEmail);

    try {
      // Use the new authentication utility
      console.log('Calling Auth.loginWithUsernameOrEmail...');
      await Auth.loginWithUsernameOrEmail(usernameOrEmail, password);
      
      console.log('Login successful, navigating...');
      // Successful login
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.reason || 'Login failed. Please try again.');
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };

  // RTL-aware styles
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px',
    direction: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'right' : 'left'
  };

  // Show loading state if i18n is not ready
  if (!isI18nReady) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading translations...</h2>
          <p>Please wait while the application initializes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page" style={containerStyle}>
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
            {t('loginPopup-title')}
          </h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            {t('welcome-board')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Debug info */}
          <div style={{ 
            backgroundColor: '#f0f8ff', 
            padding: '10px', 
            marginBottom: '20px', 
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666'
          }}>
            <strong>Debug Info:</strong><br/>
            i18n Ready: {isI18nReady ? 'Yes' : 'No'}<br/>
            Current Language: {currentLanguage}<br/>
            RTL: {isRTL ? 'Yes' : 'No'}<br/>
            Loading State: {isLoading ? 'True' : 'False'}
          </div>
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
            <label htmlFor="usernameOrEmail" style={{
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontWeight: '500'
            }}>
              {Auth.getLabel(usernameOrEmail)}
            </label>
            <input
              id="usernameOrEmail"
              type={inputType === 'email' ? 'email' : 'text'}
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '16px',
                transition: 'border-color 0.3s ease'
              }}
              placeholder={Auth.getPlaceholder(usernameOrEmail)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '25px' }}>
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
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              backgroundColor: '#2196F3',
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
            {isLoading ? t('loading') : t('loginPopup-title')}
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
            to="/sign-up"
            style={{
              color: '#2196F3',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: '16px'
              }}
          >
            {t('signupPopup-title')}
          </Link>
        </div>

        {/* Language selector */}
        <div className="language-selector" style={{
          marginTop: '20px',
          textAlign: 'center',
          direction: isRTL ? 'rtl' : 'ltr'
        }}>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
            {t('language') || 'Language'}
          </p>
          <select
            value={currentLanguage}
            onChange={(e) => TAPi18n.setLanguage(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              direction: isRTL ? 'rtl' : 'ltr'
            }}
          >
            {TAPi18n.getSupportedLanguages().map(lang => (
              <option key={lang.tag} value={lang.tag}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
