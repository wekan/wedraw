import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Accessibility Component
 * 
 * Replaces the original Blaze accessibility component with a React component.
 * This component provides accessibility settings and features for users
 * with different accessibility needs.
 * 
 * Original Blaze component had:
 * - accessibility: Main accessibility component
 * - Settings subscription and management
 * - Error and loading state handling
 */
const Accessibility = ({ onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({});

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, currentSetting } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    if (!user) return {
      currentUser: null,
      currentSetting: null
    };

    const setting = ReactiveCache.getCurrentSetting();

    return {
      currentUser: user,
      currentSetting: setting
    };
  }, []);

  // Load accessibility settings
  useEffect(() => {
    if (!currentUser) return;

    const loadSettings = async () => {
      try {
        setLoading(true);
        setError('');

        // Subscribe to settings
        await new Promise((resolve, reject) => {
          Meteor.subscribe('setting', {
            onReady: resolve,
            onError: reject
          });
        });

        // Get current settings
        const currentSettings = ReactiveCache.getCurrentSetting();
        if (currentSettings) {
          setSettings(currentSettings);
        }
      } catch (err) {
        console.error('Error loading accessibility settings:', err);
        setError(t('error-loading-settings'));
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [currentUser, t]);

  // Handle setting change
  const handleSettingChange = useCallback(async (settingKey, value) => {
    try {
      setLoading(true);
      setError('');

      // TODO: Implement setting update using Meteor.call
      console.log('Update setting:', settingKey, value);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error('Error updating setting:', err);
      setError(t('error-updating-setting'));
    } finally {
      setLoading(false);
    }
  }, [onUpdate, t]);

  // Handle high contrast toggle
  const handleHighContrastToggle = useCallback(() => {
    const newValue = !settings.highContrast;
    handleSettingChange('highContrast', newValue);
  }, [settings.highContrast, handleSettingChange]);

  // Handle large text toggle
  const handleLargeTextToggle = useCallback(() => {
    const newValue = !settings.largeText;
    handleSettingChange('largeText', newValue);
  }, [settings.largeText, handleSettingChange]);

  // Handle screen reader support toggle
  const handleScreenReaderToggle = useCallback(() => {
    const newValue = !settings.screenReaderSupport;
    handleSettingChange('screenReaderSupport', newValue);
  }, [settings.screenReaderSupport, handleSettingChange]);

  // Handle keyboard navigation toggle
  const handleKeyboardNavigationToggle = useCallback(() => {
    const newValue = !settings.keyboardNavigation;
    handleSettingChange('keyboardNavigation', newValue);
  }, [settings.keyboardNavigation, handleSettingChange]);

  // Handle focus indicators toggle
  const handleFocusIndicatorsToggle = useCallback(() => {
    const newValue = !settings.focusIndicators;
    handleSettingChange('focusIndicators', newValue);
  }, [settings.focusIndicators, handleSettingChange]);

  if (!currentUser) {
    return (
      <div className="accessibility error">
        <div className="error-message">
          <i className="fa fa-exclamation-triangle"></i>
          {t('error-notAuthorized')}
        </div>
      </div>
    );
  }

  return (
    <div className="accessibility js-accessibility">
      {/* Header */}
      <div className="accessibility-header">
        <h2 className="accessibility-title">
          <i className="fa fa-universal-access"></i>
          {t('accessibility-settings')}
        </h2>
        
        {onClose && (
          <button
            className="btn btn-sm btn-close"
            onClick={onClose}
            title={t('close')}
          >
            <i className="fa fa-times"></i>
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="accessibility-error">
          <div className="error-message">
            <i className="fa fa-exclamation-triangle"></i>
            {error}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="accessibility-loading">
          <div className="loading-spinner">
            <i className="fa fa-spinner fa-spin"></i>
            {t('loading')}
          </div>
        </div>
      )}

      {/* Accessibility Settings */}
      <div className="accessibility-content">
        <div className="accessibility-section">
          <h3 className="section-title">{t('visual-accessibility')}</h3>
          
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                className="setting-checkbox"
                checked={settings.highContrast || false}
                onChange={handleHighContrastToggle}
                disabled={loading}
              />
              <span className="checkmark"></span>
              {t('high-contrast-mode')}
            </label>
            <p className="setting-description">
              {t('high-contrast-description')}
            </p>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                className="setting-checkbox"
                checked={settings.largeText || false}
                onChange={handleLargeTextToggle}
                disabled={loading}
              />
              <span className="checkmark"></span>
              {t('large-text-mode')}
            </label>
            <p className="setting-description">
              {t('large-text-description')}
            </p>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                className="setting-checkbox"
                checked={settings.focusIndicators || false}
                onChange={handleFocusIndicatorsToggle}
                disabled={loading}
              />
              <span className="checkmark"></span>
              {t('focus-indicators')}
            </label>
            <p className="setting-description">
              {t('focus-indicators-description')}
            </p>
          </div>
        </div>

        <div className="accessibility-section">
          <h3 className="section-title">{t('navigation-accessibility')}</h3>
          
          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                className="setting-checkbox"
                checked={settings.keyboardNavigation || false}
                onChange={handleKeyboardNavigationToggle}
                disabled={loading}
              />
              <span className="checkmark"></span>
              {t('enhanced-keyboard-navigation')}
            </label>
            <p className="setting-description">
              {t('keyboard-navigation-description')}
            </p>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              <input
                type="checkbox"
                className="setting-checkbox"
                checked={settings.screenReaderSupport || false}
                onChange={handleScreenReaderToggle}
                disabled={loading}
              />
              <span className="checkmark"></span>
              {t('screen-reader-support')}
            </label>
            <p className="setting-description">
              {t('screen-reader-description')}
            </p>
          </div>
        </div>

        <div className="accessibility-section">
          <h3 className="section-title">{t('keyboard-shortcuts')}</h3>
          
          <div className="shortcuts-list">
            <div className="shortcut-item">
              <kbd className="shortcut-key">Tab</kbd>
              <span className="shortcut-description">{t('navigate-between-elements')}</span>
            </div>
            
            <div className="shortcut-item">
              <kbd className="shortcut-key">Enter</kbd>
              <span className="shortcut-description">{t('activate-element')}</span>
            </div>
            
            <div className="shortcut-item">
              <kbd className="shortcut-key">Space</kbd>
              <span className="shortcut-description">{t('toggle-checkbox')}</span>
            </div>
            
            <div className="shortcut-item">
              <kbd className="shortcut-key">Escape</kbd>
              <span className="shortcut-description">{t('close-dialog')}</span>
            </div>
            
            <div className="shortcut-item">
              <kbd className="shortcut-key">Ctrl + M</kbd>
              <span className="shortcut-description">{t('focus-main-content')}</span>
            </div>
          </div>
        </div>

        <div className="accessibility-section">
          <h3 className="section-title">{t('additional-features')}</h3>
          
          <div className="feature-item">
            <i className="fa fa-volume-up"></i>
            <div className="feature-content">
              <h4>{t('audio-descriptions')}</h4>
              <p>{t('audio-descriptions-description')}</p>
            </div>
          </div>

          <div className="feature-item">
            <i className="fa fa-hand-paper-o"></i>
            <div className="feature-content">
              <h4>{t('reduced-motion')}</h4>
              <p>{t('reduced-motion-description')}</p>
            </div>
          </div>

          <div className="feature-item">
            <i className="fa fa-eye"></i>
            <div className="feature-content">
              <h4>{t('color-blind-friendly')}</h4>
              <p>{t('color-blind-friendly-description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="accessibility-footer">
        <button
          className="btn btn-primary"
          onClick={() => {
            // TODO: Implement reset to defaults
            console.log('Reset to defaults');
          }}
          disabled={loading}
        >
          <i className="fa fa-refresh"></i>
          {t('reset-to-defaults')}
        </button>

        <button
          className="btn btn-secondary"
          onClick={() => {
            // TODO: Implement export settings
            console.log('Export settings');
          }}
          disabled={loading}
        >
          <i className="fa fa-download"></i>
          {t('export-settings')}
        </button>
      </div>
    </div>
  );
};

export default Accessibility;
