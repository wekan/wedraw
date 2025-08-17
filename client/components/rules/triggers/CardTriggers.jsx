import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * CardTriggers Component
 * 
 * Replaces the original Blaze cardTriggers component with a React component.
 * This component provides comprehensive card trigger configuration for rules,
 * including label, member, and attachment triggers.
 * 
 * Original Blaze component had:
 * - cardTriggers: Card trigger configuration interface
 * - Multiple trigger types: labels, members, attachments
 * - User specification options for each trigger
 */
const CardTriggers = ({ 
  onTriggerAdd, 
  onTriggerChange,
  currentTriggers = [],
  disabled = false 
}) => {
  const [showUserFields, setShowUserFields] = useState({});
  const [userInputs, setUserInputs] = useState({});

  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { labels } = useTracker(() => {
    const boardLabels = ReactiveCache.getLabels() || [];
    return { labels: boardLabels };
  }, []);

  // Toggle user field visibility
  const toggleUserField = useCallback((triggerId) => {
    setShowUserFields(prev => ({
      ...prev,
      [triggerId]: !prev[triggerId]
    }));
  }, []);

  // Handle user input change
  const handleUserInputChange = useCallback((triggerId, value) => {
    setUserInputs(prev => ({
      ...prev,
      [triggerId]: value
    }));
  }, []);

  // Handle trigger addition
  const handleAddTrigger = useCallback((triggerType, triggerData) => {
    if (onTriggerAdd) {
      const trigger = {
        type: triggerType,
        ...triggerData,
        id: `${triggerType}-${Date.now()}`
      };
      onTriggerAdd(trigger);
    }
  }, [onTriggerAdd]);

  // Handle trigger change
  const handleTriggerChange = useCallback((triggerId, field, value) => {
    if (onTriggerChange) {
      onTriggerChange(triggerId, field, value);
    }
  }, [onTriggerChange]);

  return (
    <div className="card-triggers js-card-triggers">
      {/* General Label Trigger */}
      <div className="trigger-item js-general-label-trigger">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-when-a-label-is')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="label-action"
              className="form-control"
              onChange={(e) => handleTriggerChange('general-label', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="added">{t('r-added-to')}</option>
              <option value="removed">{t('r-removed-from')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-a-card')}
          </div>
          
          <div className="trigger-button trigger-button-person js-show-user-field">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleUserField('general-label')}
              disabled={disabled}
            >
              <i className="fa fa-user"></i>
            </button>
          </div>
          
          <div className={`user-details ${showUserFields['general-label'] ? '' : 'hide-element'}`}>
            <div className="trigger-text">
              {t('r-by')}
            </div>
            <div className="trigger-dropdown">
              <input
                className="user-name form-control"
                type="text"
                placeholder={t('username')}
                value={userInputs['general-label'] || ''}
                onChange={(e) => handleUserInputChange('general-label', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        
        <div className="trigger-button js-add-gen-label-trigger js-goto-action">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddTrigger('general-label', {
              action: 'added',
              user: userInputs['general-label'] || null
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Specific Label Trigger */}
      <div className="trigger-item js-specific-label-trigger">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-when-the-label')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="spec-label"
              className="form-control"
              onChange={(e) => handleTriggerChange('specific-label', 'labelId', e.target.value)}
              disabled={disabled}
            >
              <option value="">{t('select-label')}</option>
              {labels.map(label => (
                <option 
                  key={label._id} 
                  value={label._id}
                  style={{ backgroundColor: label.color || '#ccc' }}
                >
                  {label.name || t('unnamed-label')}
                </option>
              ))}
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-is')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="spec-label-action"
              className="form-control"
              onChange={(e) => handleTriggerChange('specific-label', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="added">{t('r-added-to')}</option>
              <option value="removed">{t('r-removed-from')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-a-card')}
          </div>
          
          <div className="trigger-button trigger-button-person js-show-user-field">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleUserField('specific-label')}
              disabled={disabled}
            >
              <i className="fa fa-user"></i>
            </button>
          </div>
          
          <div className={`user-details ${showUserFields['specific-label'] ? '' : 'hide-element'}`}>
            <div className="trigger-text">
              {t('r-by')}
            </div>
            <div className="trigger-dropdown">
              <input
                className="user-name form-control"
                type="text"
                placeholder={t('username')}
                value={userInputs['specific-label'] || ''}
                onChange={(e) => handleUserInputChange('specific-label', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        
        <div className="trigger-button js-add-spec-label-trigger js-goto-action">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddTrigger('specific-label', {
              labelId: '',
              action: 'added',
              user: userInputs['specific-label'] || null
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* General Member Trigger */}
      <div className="trigger-item js-general-member-trigger">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-when-a-member')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="gen-member-action"
              className="form-control"
              onChange={(e) => handleTriggerChange('general-member', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="added">{t('r-added-to')}</option>
              <option value="removed">{t('r-removed-from')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-a-card')}
          </div>
          
          <div className="trigger-button trigger-button-person js-show-user-field">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleUserField('general-member')}
              disabled={disabled}
            >
              <i className="fa fa-user"></i>
            </button>
          </div>
          
          <div className={`user-details ${showUserFields['general-member'] ? '' : 'hide-element'}`}>
            <div className="trigger-text">
              {t('r-by')}
            </div>
            <div className="trigger-dropdown">
              <input
                className="user-name form-control"
                type="text"
                placeholder={t('username')}
                value={userInputs['general-member'] || ''}
                onChange={(e) => handleUserInputChange('general-member', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        
        <div className="trigger-button js-add-gen-member-trigger js-goto-action">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddTrigger('general-member', {
              action: 'added',
              user: userInputs['general-member'] || null
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Specific Member Trigger */}
      <div className="trigger-item js-specific-member-trigger">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-when-the-member')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="spec-member"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleTriggerChange('specific-member', 'memberName', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="trigger-text">
            {t('r-is')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="spec-member-action"
              className="form-control"
              onChange={(e) => handleTriggerChange('specific-member', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="added">{t('r-added-to')}</option>
              <option value="removed">{t('r-removed-from')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-a-card')}
          </div>
          
          <div className="trigger-button trigger-button-person js-show-user-field">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleUserField('specific-member')}
              disabled={disabled}
            >
              <i className="fa fa-user"></i>
            </button>
          </div>
          
          <div className={`user-details ${showUserFields['specific-member'] ? '' : 'hide-element'}`}>
            <div className="trigger-text">
              {t('r-by')}
            </div>
            <div className="trigger-dropdown">
              <input
                className="user-name form-control"
                type="text"
                placeholder={t('username')}
                value={userInputs['specific-member'] || ''}
                onChange={(e) => handleUserInputChange('specific-member', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        
        <div className="trigger-button js-add-spec-member-trigger js-goto-action">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddTrigger('specific-member', {
              memberName: '',
              action: 'added',
              user: userInputs['specific-member'] || null
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Attachment Trigger */}
      <div className="trigger-item js-attachment-trigger">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-when-a-attach')}
          </div>
          
          <div className="trigger-text">
            {t('r-is')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="attach-action"
              className="form-control"
              onChange={(e) => handleTriggerChange('attachment', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="added">{t('r-added-to')}</option>
              <option value="removed">{t('r-removed-from')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-a-card')}
          </div>
          
          <div className="trigger-button trigger-button-person js-show-user-field">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleUserField('attachment')}
              disabled={disabled}
            >
              <i className="fa fa-user"></i>
            </button>
          </div>
          
          <div className={`user-details ${showUserFields['attachment'] ? '' : 'hide-element'}`}>
            <div className="trigger-text">
              {t('r-by')}
            </div>
            <div className="trigger-dropdown">
              <input
                className="user-name form-control"
                type="text"
                placeholder={t('username')}
                value={userInputs['attachment'] || ''}
                onChange={(e) => handleUserInputChange('attachment', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        
        <div className="trigger-button js-add-attachment-trigger js-goto-action">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddTrigger('attachment', {
              action: 'added',
              user: userInputs['attachment'] || null
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Current Triggers Display */}
      {currentTriggers.length > 0 && (
        <div className="current-triggers">
          <h4>{t('current-triggers')}</h4>
          <div className="triggers-list">
            {currentTriggers.map(trigger => (
              <div key={trigger.id} className="trigger-display">
                <span className="trigger-type">{trigger.type}</span>
                <span className="trigger-action">{trigger.action}</span>
                {trigger.user && (
                  <span className="trigger-user">by {trigger.user}</span>
                )}
                <button
                  type="button"
                  className="btn btn-xs btn-danger"
                  onClick={() => onTriggerChange && onTriggerChange(trigger.id, 'remove', null)}
                  disabled={disabled}
                >
                  <i className="fa fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardTriggers;
