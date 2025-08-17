import { Meteor } from 'meteor/meteor';

/**
 * Authentication utility that supports both username and email login
 * This provides a unified interface for authentication across the application
 */
export const Auth = {
  /**
   * Login with username or email
   * @param {string} usernameOrEmail - Username or email address
   * @param {string} password - User password
   * @returns {Promise} - Promise that resolves on successful login
   */
  loginWithUsernameOrEmail: (usernameOrEmail, password) => {
    return new Promise((resolve, reject) => {
      console.log('Auth.loginWithUsernameOrEmail called with:', usernameOrEmail);
      
      // Use standard Meteor login method
      Meteor.loginWithPassword(usernameOrEmail, password, (err) => {
        console.log('Meteor.loginWithPassword callback executed, error:', err);
        if (err) {
          console.error('Login error in Auth utility:', err);
          reject(err);
        } else {
          console.log('Login successful in Auth utility');
          resolve();
        }
      });
    });
  },

  /**
   * Login with password (standard Meteor method)
   * @param {string} usernameOrEmail - Username or email address
   * @param {string} password - User password
   * @returns {Promise} - Promise that resolves on successful login
   */
  loginWithPassword: (usernameOrEmail, password) => {
    return new Promise((resolve, reject) => {
      Meteor.loginWithPassword(usernameOrEmail, password, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  },

  /**
   * Check if input is likely an email address
   * @param {string} input - Input string to check
   * @returns {boolean} - True if input looks like an email
   */
  isEmail: (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  },

  /**
   * Check if input is likely a username
   * @param {string} input - Input string to check
   * @returns {boolean} - True if input looks like a username
   */
  isUsername: (input) => {
    // Username typically doesn't contain @ symbol and is shorter
    return !input.includes('@') && input.length >= 3 && input.length <= 30;
  },

  /**
   * Get appropriate placeholder text based on input
   * @param {string} input - Current input value
   * @returns {string} - Placeholder text
   */
  getPlaceholder: (input) => {
    if (!input) {
      return 'Username or Email';
    }
    if (Auth.isEmail(input)) {
      return 'Email address';
    }
    if (Auth.isUsername(input)) {
      return 'Username';
    }
    return 'Username or Email';
  },

  /**
   * Get appropriate label text based on input
   * @param {string} input - Current input value
   * @returns {string} - Label text
   */
  getLabel: (input) => {
    if (!input) {
      return 'Username or Email';
    }
    if (Auth.isEmail(input)) {
      return 'Email';
    }
    if (Auth.isUsername(input)) {
      return 'Username';
    }
    return 'Username or Email';
  },

  /**
   * Validate input format
   * @param {string} input - Input to validate
   * @returns {Object} - Validation result with isValid and message
   */
  validateInput: (input) => {
    if (!input || input.trim().length === 0) {
      return {
        isValid: false,
        message: 'Username or email is required'
      };
    }

    if (input.trim().length < 3) {
      return {
        isValid: false,
        message: 'Username or email must be at least 3 characters'
      };
    }

    return {
      isValid: true,
      message: ''
    };
  }
};
