import React from 'react';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * PeopleSettings Component
 * 
 * Settings component for managing people and user-related settings.
 * This component provides a placeholder for future people management features.
 */
const PeopleSettings = () => {
  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  return (
    <div className="people-settings">
      <h2>{t('people-management')}</h2>
      <p>{t('people-settings-coming-soon')}</p>
      
      <div className="settings-placeholder">
        <i className="fa fa-users fa-3x"></i>
        <p>{t('people-settings-description')}</p>
      </div>
    </div>
  );
};

export default PeopleSettings;
