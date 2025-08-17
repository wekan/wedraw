import React from 'react';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * InformationSettings Component
 * 
 * Settings component for managing system information and details.
 * This component provides a placeholder for future information features.
 */
const InformationSettings = () => {
  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  return (
    <div className="information-settings">
      <h2>{t('information')}</h2>
      <p>{t('information-settings-coming-soon')}</p>
      
      <div className="settings-placeholder">
        <i className="fa fa-info-circle fa-3x"></i>
        <p>{t('information-settings-description')}</p>
      </div>
    </div>
  );
};

export default InformationSettings;
