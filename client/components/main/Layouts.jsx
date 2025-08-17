import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Layouts Component
 * 
 * Replaces the original Blaze layouts component with a React component.
 * This component provides layout management functionality for the application,
 * including user forms layout, authentication state management, and layout configuration.
 * 
 * Original Blaze component had:
 * - userFormsLayout: User forms layout management
 * - Authentication state management
 * - OIDC redirection handling
 * - Layout configuration and validation
 */
const Layouts = ({ children, layoutType = 'default' }) => {
  const [currentSetting, setCurrentSetting] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [enabledAuthMethods, setEnabledAuthMethods] = useState(['password']);
  const [isPasswordLoginEnabled, setIsPasswordLoginEnabled] = useState(true);
  const [isDisableRegistration, setIsDisableRegistration] = useState(false);
  const [isDisableForgotPassword, setIsDisableForgotPassword] = useState(false);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    return {
      currentUser: user
    };
  }, []);

  // Initialize layout settings
  useEffect(() => {
    if (!currentUser?.profile) {
      const initializeLayout = async () => {
        try {
          setIsLoading(true);

          // Check OIDC redirection
          const oidcResult = await new Promise((resolve, reject) => {
            Meteor.call('isOidcRedirectionEnabled', (error, result) => {
              if (error) reject(error);
              else resolve(result);
            });
          });

          if (oidcResult) {
            // TODO: Implement OIDC login
            console.log('OIDC redirection enabled');
          }

          // Subscribe to settings
          await new Promise((resolve, reject) => {
            Meteor.subscribe('setting', {
              onReady: resolve,
              onError: reject
            });
          });

          // Get current setting
          const setting = ReactiveCache.getCurrentSetting();
          if (setting) {
            setCurrentSetting(setting);
          }
        } catch (err) {
          console.error('Error initializing layout:', err);
        } finally {
          setIsLoading(false);
        }
      };

      initializeLayout();
    }
  }, [currentUser]);

  // Load authentication methods
  useEffect(() => {
    const loadAuthMethods = async () => {
      try {
        // Get enabled authentication methods
        const authResult = await new Promise((resolve, reject) => {
          Meteor.call('getAuthenticationsEnabled', (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        });

        if (authResult) {
          const methods = ['password'];
          Object.keys(authResult).forEach((method) => {
            if (authResult[method]) methods.push(method);
          });
          setEnabledAuthMethods(methods);
        }

        // Check password login
        const passwordResult = await new Promise((resolve, reject) => {
          Meteor.call('isPasswordLoginEnabled', (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        });

        setIsPasswordLoginEnabled(passwordResult);

        // Check registration
        const registrationResult = await new Promise((resolve, reject) => {
          Meteor.call('isDisableRegistration', (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        });

        setIsDisableRegistration(registrationResult);

        // Check forgot password
        const forgotPasswordResult = await new Promise((resolve, reject) => {
          Meteor.call('isDisableForgotPassword', (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
        });

        setIsDisableForgotPassword(forgotPasswordResult);
      } catch (err) {
        console.error('Error loading auth methods:', err);
      }
    };

    loadAuthMethods();
  }, []);

  // Handle layout state change
  const handleLayoutStateChange = useCallback((newState) => {
    if (newState !== 'signIn') {
      // Hide authentication form
      const authForm = document.querySelector('.at-form-authentication');
      if (authForm) authForm.style.display = 'none';
    } else {
      // Show authentication form
      const authForm = document.querySelector('.at-form-authentication');
      if (authForm) authForm.style.display = 'block';
    }
  }, []);

  // Check if legal notice exists
  const hasLegalNotice = currentSetting?.legalNotice && 
    currentSetting.legalNotice.trim() !== '';

  // Render based on layout type
  if (layoutType === 'userForms') {
    return (
      <div className="user-forms-layout js-user-forms-layout">
        {/* Loading State */}
        {isLoading && (
          <div className="layout-loading">
            <div className="loading-spinner">
              <i className="fa fa-spinner fa-spin"></i>
              {t('loading')}
            </div>
          </div>
        )}

        {/* Legal Notice */}
        {hasLegalNotice && (
          <div className="legal-notice">
            <div className="legal-notice-content">
              <i className="fa fa-gavel"></i>
              <span dangerouslySetInnerHTML={{ __html: currentSetting.legalNotice }} />
            </div>
          </div>
        )}

        {/* Authentication Forms */}
        <div className="authentication-forms">
          {/* Password Form */}
          {isPasswordLoginEnabled && (
            <div className="at-pwd-form">
              {/* TODO: Implement password authentication form */}
              <div className="password-form-placeholder">
                <i className="fa fa-lock"></i>
                {t('password-authentication')}
              </div>
            </div>
          )}

          {/* OAuth2 Form */}
          {enabledAuthMethods.includes('oauth2') && (
            <div className="at-oauth">
              {/* TODO: Implement OAuth2 authentication form */}
              <div className="oauth-form-placeholder">
                <i className="fa fa-key"></i>
                {t('oauth2-authentication')}
              </div>
            </div>
          )}

          {/* Registration Link */}
          {!isDisableRegistration && (
            <div className="at-signup-link">
              {/* TODO: Implement registration link */}
              <a href="#" className="signup-link">
                <i className="fa fa-user-plus"></i>
                {t('sign-up')}
              </a>
            </div>
          )}

          {/* Forgot Password Link */}
          {!isDisableForgotPassword && (
            <div className="at-pwd-link">
              {/* TODO: Implement forgot password link */}
              <a href="#" className="forgot-password-link">
                <i className="fa fa-question-circle"></i>
                {t('forgot-password')}
              </a>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="layout-content">
          {children}
        </div>
      </div>
    );
  }

  // Default layout
  return (
    <div className="default-layout js-default-layout">
      {/* Main Content */}
      <div className="layout-content">
        {children}
      </div>
    </div>
  );
};

export default Layouts;
