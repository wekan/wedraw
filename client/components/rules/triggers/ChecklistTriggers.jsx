import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * ChecklistTriggers Component
 * 
 * Replaces the original Blaze checklistTriggers component with a React component.
 * This component provides comprehensive checklist trigger configuration for rules,
 * including checklist creation, removal, completion, and item checking triggers.
 * 
 * Original Blaze component had:
 * - checklistTriggers: Checklist trigger configuration interface
 * - Multiple trigger types: creation, removal, completion, item checking
 * - User specification options for each trigger
 * - Specific checklist and item targeting
 */
const ChecklistTriggers = ({ 
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
    <div className="checklist-triggers js-checklist-triggers">
      {/* General Checklist Creation/Removal Trigger */}
      <div className="trigger-item js-general-checklist-trigger">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-when-a-checklist')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="gen-check-action"
              className="form-control"
              onChange={(e) => handleTriggerChange('general-checklist', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="created">{t('r-added-to')}</option>
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
              onClick={() => toggleUserField('general-checklist')}
              disabled={disabled}
            >
              <i className="fa fa-user"></i>
            </button>
          </div>
          
          <div className={`user-details ${showUserFields['general-checklist'] ? '' : 'hide-element'}`}>
            <div className="trigger-text">
              {t('r-by')}
            </div>
            <div className="trigger-dropdown">
              <input
                className="user-name form-control"
                type="text"
                placeholder={t('username')}
                value={userInputs['general-checklist'] || ''}
                onChange={(e) => handleUserInputChange('general-checklist', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        
        <div className="trigger-button js-add-gen-check-trigger js-goto-action">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddTrigger('general-checklist', {
              action: 'created',
              user: userInputs['general-checklist'] || null
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Specific Checklist Creation/Removal Trigger */}
      <div className="trigger-item js-specific-checklist-trigger">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-when-the-checklist')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="check-name"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleTriggerChange('specific-checklist', 'checklistName', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="trigger-text">
            {t('r-is')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="spec-check-action"
              className="form-control"
              onChange={(e) => handleTriggerChange('specific-checklist', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="created">{t('r-added-to')}</option>
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
              onClick={() => toggleUserField('specific-checklist')}
              disabled={disabled}
            >
              <i className="fa fa-user"></i>
            </button>
          </div>
          
          <div className={`user-details ${showUserFields['specific-checklist'] ? '' : 'hide-element'}`}>
            <div className="trigger-text">
              {t('r-by')}
            </div>
            <div className="trigger-dropdown">
              <input
                className="user-name form-control"
                type="text"
                placeholder={t('username')}
                value={userInputs['specific-checklist'] || ''}
                onChange={(e) => handleUserInputChange('specific-checklist', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        
        <div className="trigger-button js-add-spec-check-trigger js-goto-action">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddTrigger('specific-checklist', {
              checklistName: '',
              action: 'created',
              user: userInputs['specific-checklist'] || null
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* General Checklist Completion Trigger */}
      <div className="trigger-item js-general-completion-trigger">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-when-a-checklist')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="gen-comp-check-action"
              className="form-control"
              onChange={(e) => handleTriggerChange('general-completion', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="completed">{t('r-completed')}</option>
              <option value="uncompleted">{t('r-made-incomplete')}</option>
            </select>
          </div>
          
          <div className="trigger-button trigger-button-person js-show-user-field">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleUserField('general-completion')}
              disabled={disabled}
            >
              <i className="fa fa-user"></i>
            </button>
          </div>
          
          <div className={`user-details ${showUserFields['general-completion'] ? '' : 'hide-element'}`}>
            <div className="trigger-text">
              {t('r-by')}
            </div>
            <div className="trigger-dropdown">
              <input
                className="user-name form-control"
                type="text"
                placeholder={t('username')}
                value={userInputs['general-completion'] || ''}
                onChange={(e) => handleUserInputChange('general-completion', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        
        <div className="trigger-button js-add-gen-comp-trigger js-goto-action">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddTrigger('general-completion', {
              action: 'completed',
              user: userInputs['general-completion'] || null
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Specific Checklist Completion Trigger */}
      <div className="trigger-item js-specific-completion-trigger">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-when-the-checklist')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="spec-comp-check-name"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleTriggerChange('specific-completion', 'checklistName', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="trigger-text">
            {t('r-is')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="spec-comp-check-action"
              className="form-control"
              onChange={(e) => handleTriggerChange('specific-completion', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="completed">{t('r-completed')}</option>
              <option value="uncompleted">{t('r-made-incomplete')}</option>
            </select>
          </div>
          
          <div className="trigger-button trigger-button-person js-show-user-field">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleUserField('specific-completion')}
              disabled={disabled}
            >
              <i className="fa fa-user"></i>
            </button>
          </div>
          
          <div className={`user-details ${showUserFields['specific-completion'] ? '' : 'hide-element'}`}>
            <div className="trigger-text">
              {t('r-by')}
            </div>
            <div className="trigger-dropdown">
              <input
                className="user-name form-control"
                type="text"
                placeholder={t('username')}
                value={userInputs['specific-completion'] || ''}
                onChange={(e) => handleUserInputChange('specific-completion', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        
        <div className="trigger-button js-add-spec-comp-check-trigger js-goto-action">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddTrigger('specific-completion', {
              checklistName: '',
              action: 'completed',
              user: userInputs['specific-completion'] || null
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* General Checklist Item Check Trigger */}
      <div className="trigger-item js-general-item-trigger">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-when-a-item')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="check-item-gen-action"
              className="form-control"
              onChange={(e) => handleTriggerChange('general-item', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="checked">{t('r-checked')}</option>
              <option value="unchecked">{t('r-unchecked')}</option>
            </select>
          </div>
          
          <div className="trigger-button trigger-button-person js-show-user-field">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleUserField('general-item')}
              disabled={disabled}
            >
              <i className="fa fa-user"></i>
            </button>
          </div>
          
          <div className={`user-details ${showUserFields['general-item'] ? '' : 'hide-element'}`}>
            <div className="trigger-text">
              {t('r-by')}
            </div>
            <div className="trigger-dropdown">
              <input
                className="user-name form-control"
                type="text"
                placeholder={t('username')}
                value={userInputs['general-item'] || ''}
                onChange={(e) => handleUserInputChange('general-item', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        
        <div className="trigger-button js-add-gen-check-item-trigger js-goto-action">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddTrigger('general-item', {
              action: 'checked',
              user: userInputs['general-item'] || null
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Specific Checklist Item Check Trigger */}
      <div className="trigger-item js-specific-item-trigger">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-when-the-item')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="check-item-name"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleTriggerChange('specific-item', 'itemName', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="trigger-text">
            {t('r-is')}
          </div>
          
          <div className="trigger-dropdown">
            <select
              id="check-item-spec-action"
              className="form-control"
              onChange={(e) => handleTriggerChange('specific-item', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="checked">{t('r-checked')}</option>
              <option value="unchecked">{t('r-unchecked')}</option>
            </select>
          </div>
          
          <div className="trigger-button trigger-button-person js-show-user-field">
            <button
              type="button"
              className="btn btn-sm btn-link"
              onClick={() => toggleUserField('specific-item')}
              disabled={disabled}
            >
              <i className="fa fa-user"></i>
            </button>
          </div>
          
          <div className={`user-details ${showUserFields['specific-item'] ? '' : 'hide-element'}`}>
            <div className="trigger-text">
              {t('r-by')}
            </div>
            <div className="trigger-dropdown">
              <input
                className="user-name form-control"
                type="text"
                placeholder={t('username')}
                value={userInputs['specific-item'] || ''}
                onChange={(e) => handleUserInputChange('specific-item', e.target.value)}
                disabled={disabled}
              />
            </div>
          </div>
        </div>
        
        <div className="trigger-button js-add-spec-check-item-trigger js-goto-action">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddTrigger('specific-item', {
              itemName: '',
              action: 'checked',
              user: userInputs['specific-item'] || null
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
                {trigger.action && (
                  <span className="trigger-action">{trigger.action}</span>
                )}
                {trigger.checklistName && (
                  <span className="trigger-checklist">checklist: {trigger.checklistName}</span>
                )}
                {trigger.itemName && (
                  <span className="trigger-item">item: {trigger.itemName}</span>
                )}
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

export default ChecklistTriggers;
