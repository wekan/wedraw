import React from 'react';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * TranslationSettings Component
 * 
 * Settings component for managing translations and localization.
 * This component provides a placeholder for future translation features.
 */
const TranslationSettings = () => {
  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  return (
    <div className="translation-settings">
      <h2>{t('translation')}</h2>
      <p>{t('translation-settings-coming-soon')}</p>
      
      <div className="settings-placeholder">
        <i className="fa fa-language fa-3x"></i>
        <p>{t('translation-settings-description')}</p>
      </div>
    </div>
  );
};

export default TranslationSettings;
