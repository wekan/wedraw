import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { TAPi18n } from '/imports/i18n';
import { Auth } from '/imports/utils/auth';

/**
 * LoginPage Component
 * 
 * Shows the login form on the main page when the user is not logged in.
 * Supports translations and RTL languages.
 */
const LoginPage = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [inputType, setInputType] = useState('username-or-email'); // 'username-or-email', 'email', 'username'
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

    try {
      // Use the new authentication utility
      await Auth.loginWithUsernameOrEmail(usernameOrEmail, password);
      
      // Successful login
      navigate('/');
    } catch (err) {
      setError(err.reason || t('error-login-failed') || 'Login failed. Please try again.');
    } finally {
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

  const authContainerStyle = {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    direction: isRTL ? 'rtl' : 'ltr'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '30px',
    direction: isRTL ? 'rtl' : 'ltr'
  };

  const titleStyle = {
    color: '#333',
    marginBottom: '10px',
    fontSize: '28px',
    fontWeight: '600',
    direction: isRTL ? 'rtl' : 'ltr'
  };

  const descriptionStyle = {
    color: '#666',
    fontSize: '16px',
    direction: isRTL ? 'rtl' : 'ltr'
  };

  const formGroupStyle = {
    marginBottom: '20px',
    direction: isRTL ? 'rtl' : 'ltr'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: '#333',
    fontWeight: '500',
    direction: isRTL ? 'rtl' : 'ltr'
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '16px',
    transition: 'border-color 0.3s ease',
    direction: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'right' : 'left'
  };

  const buttonStyle = {
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
    transition: 'background-color 0.3s ease',
    direction: isRTL ? 'rtl' : 'ltr'
  };

  const footerStyle = {
    textAlign: 'center',
    marginTop: '25px',
    paddingTop: '25px',
    borderTop: '1px solid #e0e0e0',
    direction: isRTL ? 'rtl' : 'ltr'
  };

  const linkStyle = {
    color: '#2196F3',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '16px',
    direction: isRTL ? 'rtl' : 'ltr'
  };

  return (
    <div className="login-page" style={containerStyle}>
      <div className="login-container" style={authContainerStyle}>
        <div className="login-header" style={headerStyle}>
          <h1 style={titleStyle}>
            {t('loginPopup-title')}
          </h1>
          <p style={descriptionStyle}>
            {t('welcome-board')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message" style={{
              backgroundColor: '#ffebee',
              color: '#c62828',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px',
              direction: isRTL ? 'rtl' : 'ltr'
            }}>
              {error}
            </div>
          )}

          <div className="form-group" style={formGroupStyle}>
            <label htmlFor="usernameOrEmail" style={labelStyle}>
              {Auth.getLabel(usernameOrEmail)}
            </label>
            <input
              id="usernameOrEmail"
              type={inputType === 'email' ? 'email' : 'text'}
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
              style={inputStyle}
              placeholder={Auth.getPlaceholder(usernameOrEmail)}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          <div className="form-group" style={{ ...formGroupStyle, marginBottom: '25px' }}>
            <label htmlFor="password" style={labelStyle}>
              {t('password') || 'Password'}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder={t('password')}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={buttonStyle}
          >
            {isLoading ? t('loading') : t('loginPopup-title')}
          </button>
        </form>

        <div className="login-footer" style={footerStyle}>
          <p style={{ color: '#666', marginBottom: '15px' }}>
            {t('if-you-already-have-an-account')}
          </p>
          <Link
            to="/sign-up"
            style={linkStyle}
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

export default LoginPage;
