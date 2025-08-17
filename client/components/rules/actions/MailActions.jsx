import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * MailActions Component
 * 
 * Replaces the original Blaze mailActions component with a React component.
 * This component provides email action configuration for rules,
 * allowing users to set up automated email sending.
 * 
 * Original Blaze component had:
 * - mailActions: Email action configuration interface
 * - Email recipient, subject, and message configuration
 */
const MailActions = ({ 
  onActionAdd, 
  onActionChange,
  currentActions = [],
  disabled = false 
}) => {
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    return { currentUser: user };
  }, []);

  // Handle input change
  const handleInputChange = useCallback((field, value) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
    
    if (onActionChange) {
      onActionChange('mail', field, value);
    }
  }, [onActionChange]);

  // Handle action addition
  const handleAddAction = useCallback(() => {
    if (onActionAdd && emailData.to && emailData.subject) {
      const action = {
        type: 'mail',
        ...emailData,
        id: `mail-${Date.now()}`
      };
      onActionAdd(action);
      
      // Reset form
      setEmailData({
        to: '',
        subject: '',
        message: ''
      });
    }
  }, [onActionAdd, emailData]);

  // Validate form
  const isFormValid = emailData.to.trim() && emailData.subject.trim();

  return (
    <div className="mail-actions js-mail-actions">
      <div className="trigger-item trigger-item-mail js-mail-action">
        <div className="trigger-content trigger-content-mail">
          <div className="trigger-text trigger-text-email">
            {t('r-send-email')}
          </div>
          
          <div className="trigger-dropdown-mail">
            <input
              id="email-to"
              type="text"
              className="form-control"
              placeholder={t('r-to')}
              value={emailData.to}
              onChange={(e) => handleInputChange('to', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <input
            id="email-subject"
            type="text"
            className="form-control"
            placeholder={t('r-subject')}
            value={emailData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            disabled={disabled}
          />
          
          <textarea
            id="email-msg"
            className="form-control"
            placeholder={t('r-message')}
            value={emailData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows="3"
            disabled={disabled}
          />
        </div>
        
        <div className="trigger-button trigger-button-email js-mail-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={handleAddAction}
            disabled={disabled || !isFormValid}
            title={!isFormValid ? t('fill-required-fields') : t('add-mail-action')}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Current Mail Actions Display */}
      {currentActions.length > 0 && (
        <div className="current-mail-actions">
          <h4>{t('current-mail-actions')}</h4>
          <div className="mail-actions-list">
            {currentActions.map(action => (
              <div key={action.id} className="mail-action-display">
                <span className="action-type">{action.type}</span>
                {action.to && (
                  <span className="action-to">to: {action.to}</span>
                )}
                {action.subject && (
                  <span className="action-subject">subject: {action.subject}</span>
                )}
                {action.message && (
                  <span className="action-message">message: {action.message.substring(0, 50)}...</span>
                )}
                <button
                  type="button"
                  className="btn btn-xs btn-danger"
                  onClick={() => onActionChange && onActionChange(action.id, 'remove', null)}
                  disabled={disabled}
                >
                  <i className="fa fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Validation Messages */}
      {!isFormValid && (
        <div className="form-validation">
          <small className="text-muted">
            {t('fill-required-fields')}: {t('r-to')}, {t('r-subject')}
          </small>
        </div>
      )}
    </div>
  );
};

export default MailActions;
