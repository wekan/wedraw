import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * ConnectionMethod Component
 * 
 * Replaces the original Blaze connectionMethod component with a React component.
 * This component provides authentication method selection for users.
 * 
 * Original Blaze component had:
 * - connectionMethod: Authentication method selection dropdown
 * - Dynamic authentication options with selected state
 */
const ConnectionMethod = ({ 
  value, 
  onChange, 
  authentications = [], 
  isSelected = null,
  disabled = false,
  className = '',
  onUpdate 
}) => {
  const [selectedValue, setSelectedValue] = useState(value || '');

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data for authentications if not provided
  const { authMethods } = useTracker(() => {
    if (authentications.length > 0) {
      return { authMethods: authentications };
    }

    // Get authentication methods from ReactiveCache if not provided
    const methods = ReactiveCache.getAuthenticationMethods() || [
      'password',
      'oauth2',
      'oidc',
      'ldap',
      'saml'
    ];

    return { authMethods: methods };
  }, [authentications]);

  // Update local state when prop changes
  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  // Handle selection change
  const handleChange = useCallback((event) => {
    const newValue = event.target.value;
    setSelectedValue(newValue);
    
    if (onChange) {
      onChange(newValue);
    }
    
    if (onUpdate) {
      onUpdate(newValue);
    }
  }, [onChange, onUpdate]);

  // Check if a value is selected
  const isValueSelected = useCallback((authValue) => {
    if (isSelected) {
      return isSelected(authValue);
    }
    return selectedValue === authValue;
  }, [isSelected, selectedValue]);

  return (
    <div className="at-form-authentication js-connection-method">
      <label className="form-label">
        {t('authentication-method')}
      </label>
      
      <select
        className="select-authentication form-control"
        value={selectedValue}
        onChange={handleChange}
        disabled={disabled}
      >
        <option value="">{t('select-authentication-method')}</option>
        
        {authMethods.map((authMethod) => (
          <option
            key={authMethod}
            value={authMethod}
            selected={isValueSelected(authMethod)}
          >
            {t(authMethod) || authMethod}
          </option>
        ))}
      </select>
      
      {selectedValue && (
        <div className="authentication-info">
          <small className="text-muted">
            {t('selected-method')}: {t(selectedValue) || selectedValue}
          </small>
        </div>
      )}
    </div>
  );
};

export default ConnectionMethod;
