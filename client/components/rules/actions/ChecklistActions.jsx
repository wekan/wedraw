import React, { useState, useEffect, useCallback } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { ReactiveCache } from '/imports/reactiveCache';

// Import translations
import enTranslations from '/imports/i18n/data/en.i18n.json';

/**
 * ChecklistActions Component
 * 
 * Replaces the original Blaze checklistActions component with a React component.
 * This component provides comprehensive checklist action configuration for rules,
 * including checklist management, item checking, and checklist creation.
 * 
 * Original Blaze component had:
 * - checklistActions: Checklist action configuration interface
 * - Multiple action types: add/remove checklist, check/uncheck items, create checklist with items
 */
const ChecklistActions = ({ 
  onActionAdd, 
  onActionChange,
  currentActions = [],
  disabled = false 
}) => {
  // Helper function to get translations
  const t = (key) => {
    return enTranslations[key] || key;
  };

  // Track reactive data
  const { currentUser } = useTracker(() => {
    const user = ReactiveCache.getCurrentUser();
    return { currentUser: user };
  }, []);

  // Handle action addition
  const handleAddAction = useCallback((actionType, actionData) => {
    if (onActionAdd) {
      const action = {
        type: actionType,
        ...actionData,
        id: `${actionType}-${Date.now()}`
      };
      onActionAdd(action);
    }
  }, [onActionAdd]);

  // Handle action change
  const handleActionChange = useCallback((actionId, field, value) => {
    if (onActionChange) {
      onActionChange(actionId, field, value);
    }
  }, [onActionChange]);

  return (
    <div className="checklist-actions js-checklist-actions">
      {/* Add/Remove Checklist Action */}
      <div className="trigger-item js-add-checklist-action">
        <div className="trigger-content">
          <div className="trigger-dropdown">
            <select
              id="check-action"
              className="form-control"
              onChange={(e) => handleActionChange('checklist', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="add">{t('r-add')}</option>
              <option value="remove">{t('r-remove')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-checklist')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="checklist-name"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleActionChange('checklist', 'checklistName', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
        
        <div className="trigger-button js-add-checklist-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('checklist', {
              action: 'add',
              checklistName: ''
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Check/Uncheck All Items Action */}
      <div className="trigger-item js-add-checkall-action">
        <div className="trigger-content">
          <div className="trigger-dropdown">
            <select
              id="checkall-action"
              className="form-control"
              onChange={(e) => handleActionChange('checkall', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="check">{t('r-check-all')}</option>
              <option value="uncheck">{t('r-uncheck-all')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-items-check')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="checklist-name2"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleActionChange('checkall', 'checklistName', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
        
        <div className="trigger-button js-add-checkall-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('checkall', {
              action: 'check',
              checklistName: ''
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Check/Uncheck Specific Item Action */}
      <div className="trigger-item js-add-check-item-action">
        <div className="trigger-content">
          <div className="trigger-dropdown">
            <select
              id="check-item-action"
              className="form-control"
              onChange={(e) => handleActionChange('check-item', 'action', e.target.value)}
              disabled={disabled}
            >
              <option value="check">{t('r-check')}</option>
              <option value="uncheck">{t('r-uncheck')}</option>
            </select>
          </div>
          
          <div className="trigger-text">
            {t('r-item')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="checkitem-name"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleActionChange('check-item', 'itemName', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="trigger-text">
            {t('r-of-checklist')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="checklist-name3"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleActionChange('check-item', 'checklistName', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
        
        <div className="trigger-button js-add-check-item-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('check-item', {
              action: 'check',
              itemName: '',
              checklistName: ''
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Add Checklist with Items Action */}
      <div className="trigger-item js-add-checklist-items-action">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-add-checklist')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="checklist-name-3"
              type="text"
              className="form-control"
              placeholder={t('r-name')}
              onChange={(e) => handleActionChange('add-checklist-items', 'checklistName', e.target.value)}
              disabled={disabled}
            />
          </div>
          
          <div className="trigger-text">
            {t('r-with-items')}
          </div>
          
          <div className="trigger-dropdown">
            <input
              id="checklist-items"
              type="text"
              className="form-control"
              placeholder={t('r-items-list')}
              onChange={(e) => handleActionChange('add-checklist-items', 'items', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
        
        <div className="trigger-button js-add-checklist-items-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('add-checklist-items', {
              checklistName: '',
              items: ''
            })}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Checklist Note Action */}
      <div className="trigger-item js-checklist-note-action">
        <div className="trigger-content">
          <div className="trigger-text">
            {t('r-checklist-note')}
          </div>
        </div>
        
        <div className="trigger-button js-add-checklist-note-action js-goto-rules">
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => handleAddAction('checklist-note', {})}
            disabled={disabled}
          >
            <i className="fa fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Current Actions Display */}
      {currentActions.length > 0 && (
        <div className="current-actions">
          <h4>{t('current-actions')}</h4>
          <div className="actions-list">
            {currentActions.map(action => (
              <div key={action.id} className="action-display">
                <span className="action-type">{action.type}</span>
                {action.action && (
                  <span className="action-action">{action.action}</span>
                )}
                {action.checklistName && (
                  <span className="action-checklist">checklist: {action.checklistName}</span>
                )}
                {action.itemName && (
                  <span className="action-item">item: {action.itemName}</span>
                )}
                {action.items && (
                  <span className="action-items">items: {action.items}</span>
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
    </div>
  );
};

export default ChecklistActions;
