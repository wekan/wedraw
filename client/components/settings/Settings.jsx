import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import SettingHeaderComponent from './SettingHeaderComponent';
import PeopleSettings from './PeopleSettings';
import ReportsSettings from './ReportsSettings';
import AttachmentsSettings from './AttachmentsSettings';
import TranslationSettings from './TranslationSettings';
import InformationSettings from './InformationSettings';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * Settings Component
 * 
 * Main settings page component that provides the overall settings layout.
 * This component integrates the SettingHeader and provides routing for
 * different settings sections.
 * 
 * Features:
 * - Admin panel header with navigation
 * - Route-based settings content
 * - Authentication protection
 * - Responsive layout
 */
const Settings = () => {
  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser, isAdmin } = useTracker(() => {
    return {
      currentUser: Meteor.user(),
      isAdmin: Meteor.user()?.isAdmin || false,
    };
  }, []);

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  // Redirect to home if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="settings-page">
      <SettingHeaderComponent />
      
      <div className="settings-content">
        <Routes>
          <Route path="/" element={<SettingsOverview />} />
          <Route path="/people" element={<PeopleSettings />} />
          <Route path="/reports" element={<ReportsSettings />} />
          <Route path="/attachments" element={<AttachmentsSettings />} />
          <Route path="/translation" element={<TranslationSettings />} />
          <Route path="/information" element={<InformationSettings />} />
        </Routes>
      </div>
    </div>
  );
};

// Settings Overview Component
const SettingsOverview = () => {
  const t = (key) => enTranslations[key] || key;

  return (
    <div className="settings-overview">
      <h2>{t('settings-overview')}</h2>
      <p>{t('settings-overview-description')}</p>
      
      <div className="settings-grid">
        <div className="settings-card">
          <h3>{t('general-settings')}</h3>
          <p>{t('general-settings-description')}</p>
        </div>
        
        <div className="settings-card">
          <h3>{t('user-management')}</h3>
          <p>{t('user-management-description')}</p>
        </div>
        
        <div className="settings-card">
          <h3>{t('system-reports')}</h3>
          <p>{t('system-reports-description')}</p>
        </div>
      </div>
    </div>
  );
};



export default Settings;
