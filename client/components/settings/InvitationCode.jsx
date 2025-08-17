import React, { useState, useEffect, useCallback } from 'react';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * InvitationCode Component
 * 
 * Replaces the original Blaze invitationCode component with a React component.
 * This component provides an invitation code input field for user registration.
 * 
 * Original Blaze component had:
 * - invitationCode: Invitation code input field
 * - Label and input with placeholder
 */
const InvitationCode = ({ 
  value = '', 
  onChange, 
  placeholder,
  disabled = false,
  required = false,
  className = '',
  onUpdate 
}) => {
  const [codeValue, setCodeValue] = useState(value);

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Update local state when prop changes
  useEffect(() => {
    setCodeValue(value);
  }, [value]);

  // Handle input change
  const handleChange = useCallback((event) => {
    const newValue = event.target.value;
    setCodeValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
    
    if (onUpdate) {
      onUpdate(newValue);
    }
  }, [onChange, onUpdate]);

  // Handle input blur
  const handleBlur = useCallback(() => {
    if (onUpdate) {
      onUpdate(codeValue);
    }
  }, [codeValue, onUpdate]);

  return (
    <div className={`at-input invitation-code ${className}`} id="invitationcode">
      <label htmlFor="at-field-invitationcode" className="form-label">
        {t('invitation-code')}
        {required && <span className="required">*</span>}
      </label>
      
      <input
        id="at-field-invitationcode"
        type="text"
        name="at-field-invitationcode"
        className="form-control"
        placeholder={placeholder || t('invitation-code')}
        value={codeValue}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
      />
      
      {codeValue && (
        <div className="invitation-code-info">
          <small className="text-muted">
            {t('invitation-code-entered')}: {codeValue}
          </small>
        </div>
      )}
    </div>
  );
};

export default InvitationCode;
