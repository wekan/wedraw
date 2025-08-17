import React from 'react';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * AttachmentsSettings Component
 * 
 * Settings component for managing file attachments and storage.
 * This component provides a placeholder for future attachment management features.
 */
const AttachmentsSettings = () => {
  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  return (
    <div className="attachments-settings">
      <h2>{t('attachments')}</h2>
      <p>{t('attachments-settings-coming-soon')}</p>
      
      <div className="settings-placeholder">
        <i className="fa fa-paperclip fa-3x"></i>
        <p>{t('attachments-settings-description')}</p>
      </div>
    </div>
  );
};

export default AttachmentsSettings;
