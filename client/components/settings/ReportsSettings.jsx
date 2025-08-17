import React from 'react';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * ReportsSettings Component
 * 
 * Settings component for managing system reports and analytics.
 * This component provides a placeholder for future reporting features.
 */
const ReportsSettings = () => {
  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  return (
    <div className="reports-settings">
      <h2>{t('system-reports')}</h2>
      <p>{t('reports-settings-coming-soon')}</p>
      
      <div className="settings-placeholder">
        <i className="fa fa-chart-bar fa-3x"></i>
        <p>{t('reports-settings-description')}</p>
      </div>
    </div>
  );
};

export default ReportsSettings;
